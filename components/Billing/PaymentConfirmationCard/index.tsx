"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ConfirmPayment, StartPaymentThreeDS } from "@/api/billing";
import type { PaymentConfirmationStatus } from "@/core/billing";
import { ErrorCode } from "@/core/error";
import { DASHBOARD_PATH, LOGIN_PATH } from "@/core/routes";
import {
  clearPendingPaymentConfirmation,
  getPendingPaymentConfirmation,
  setPendingPaymentConfirmation,
} from "@/core/storage";
import useAuth from "@/contexts/AuthContext/useAuth";
import { useFailureReason } from "@/hooks/Billing/useFailureReason";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { IsErrorCode } from "@/utils/error";
import AuthCardHeader from "@/components/Auth/AuthCardHeader";
import Loading from "@/components/Loading";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import NoderaLink from "@/components/NoderaLink";
import type { PaymentConfirmationCardProps } from "./type";

type Outcome =
  | { kind: "checking" }
  | { kind: "redirecting" }
  | { kind: "succeeded" }
  | { kind: "failed"; reason: string | null }
  | { kind: "pending" }
  | { kind: "notCompleted" }
  | { kind: "invalid" }
  | { kind: "error"; message: string };

/**
 * The 3-D Secure link from the email, and the page the bank returns to. The token authorizes
 * this one Payment, so nothing here depends on a session. The link only reads the status;
 * the bank step is opened (lazily) when the Payment still awaits the cardholder.
 */
export default function PaymentConfirmationCard({
  paymentId,
  token,
  result,
}: PaymentConfirmationCardProps) {
  const t = useTranslations("billing.confirm");
  const { currentUser } = useAuth();
  const { getErrorMessage } = useErrorMessage();
  const { describeFailureReason } = useFailureReason();
  const [outcome, setOutcome] = useState<Outcome>({ kind: "checking" });
  // The status read, and above all the bank step, run once per page whatever re-renders.
  const started = useRef(false);

  // The bank's return carries no token: the one stashed before leaving is used, and only
  // for the same Payment.
  const stash = getPendingPaymentConfirmation();
  const effectiveToken =
    token ?? (stash && stash.paymentId === paymentId ? stash.token : null);

  const settle = (next: Outcome) => {
    if (next.kind === "succeeded" || next.kind === "failed" || next.kind === "invalid") {
      clearPendingPaymentConfirmation();
    }
    setOutcome(next);
  };

  const startThreeDS = useCallback(async () => {
    if (!paymentId || !effectiveToken) return;
    setOutcome({ kind: "redirecting" });
    setPendingPaymentConfirmation({ paymentId, token: effectiveToken });
    try {
      const response = await StartPaymentThreeDS(paymentId, effectiveToken);
      const { redirectUrl, htmlContent } = response.data ?? {};
      if (redirectUrl) {
        window.location.assign(redirectUrl);
        return;
      }
      if (htmlContent) {
        // The bank's own form, which posts itself on load: it replaces this page entirely.
        document.open();
        document.write(htmlContent);
        document.close();
        return;
      }
      setOutcome({ kind: "error", message: t("startFailed") });
    } catch (error) {
      if (IsErrorCode(error, ErrorCode.PaymentConfirmationInvalid))
        settle({ kind: "invalid" });
      else setOutcome({ kind: "error", message: getErrorMessage(error) });
    }
  }, [paymentId, effectiveToken, getErrorMessage]);

  /**
   * Reads the current status. From the email link a Payment awaiting the cardholder opens the
   * bank step; after the bank's return (or a back-button restore) it is offered instead, so a
   * declined step never loops straight back to the bank.
   */
  const check = useCallback(
    async (autoStart: boolean) => {
      if (!paymentId || !effectiveToken) return;
      setOutcome({ kind: "checking" });
      let current: PaymentConfirmationStatus;
      try {
        const response = await ConfirmPayment(paymentId, effectiveToken);
        current = response.data;
      } catch (error) {
        // Back from the bank, the token may already be spent; the bank's word stands then.
        if (result) {
          settle(
            result === "succeeded" ? { kind: "succeeded" } : { kind: "failed", reason: null }
          );
        } else if (IsErrorCode(error, ErrorCode.PaymentConfirmationInvalid)) {
          settle({ kind: "invalid" });
        } else {
          setOutcome({ kind: "error", message: getErrorMessage(error) });
        }
        return;
      }
      switch (current?.status) {
        case "succeeded":
          settle({ kind: "succeeded" });
          return;
        case "failed":
          settle({ kind: "failed", reason: current.failureReason ?? null });
          return;
        case "pending":
          setOutcome({ kind: "pending" });
          return;
        case "confirmation_required":
          if (autoStart) await startThreeDS();
          else setOutcome({ kind: "notCompleted" });
          return;
        default:
          setOutcome({ kind: "error", message: t("unknownStatus") });
      }
    },
    [paymentId, effectiveToken, result, startThreeDS, getErrorMessage]
  );

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (!paymentId) return;
    if (effectiveToken) {
      void check(!result);
      return;
    }
    // The bank's return in another browser (no stash): its result is all there is.
    if (result) {
      settle(
        result === "succeeded" ? { kind: "succeeded" } : { kind: "failed", reason: null }
      );
    }
  }, []);

  // Back from the bank page through the browser's back button, the page is restored still
  // "redirecting": read the status again instead of spinning forever.
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) void check(false);
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [check]);

  const back = (
    <p className="text-center text-sm">
      <NoderaLink href={currentUser ? DASHBOARD_PATH : LOGIN_PATH}>
        {currentUser ? t("goToDashboard") : t("goToLogin")}
      </NoderaLink>
    </p>
  );

  if (!paymentId || (!effectiveToken && !result)) {
    return (
      <div className="flex flex-col gap-section">
        <AuthCardHeader title={t("title")} />
        <NoderaAlert variant="error" message={t("missingParams")} />
        {back}
      </div>
    );
  }

  switch (outcome.kind) {
    case "checking":
    case "redirecting":
      return (
        <div className="flex flex-col gap-section">
          <AuthCardHeader
            title={t("title")}
            subtitle={outcome.kind === "checking" ? t("checking") : t("redirecting")}
          />
          <Loading />
        </div>
      );
    case "succeeded":
      return (
        <div className="flex flex-col gap-section">
          <AuthCardHeader title={t("successTitle")} subtitle={t("successMessage")} />
          {back}
        </div>
      );
    case "failed":
      return (
        <div className="flex flex-col gap-section">
          <AuthCardHeader title={t("failedTitle")} />
          <NoderaAlert
            variant="error"
            message={t("failedMessage")}
            description={describeFailureReason(outcome.reason)}
          />
          {back}
        </div>
      );
    case "pending":
      return (
        <div className="flex flex-col gap-section">
          <AuthCardHeader title={t("pendingTitle")} subtitle={t("pendingMessage")} />
          <NoderaButton variant="outlined" fullWidth onClick={() => void check(false)}>
            {t("checkAgain")}
          </NoderaButton>
          {back}
        </div>
      );
    case "notCompleted":
      return (
        <div className="flex flex-col gap-section">
          <AuthCardHeader title={t("notCompletedTitle")} subtitle={t("notCompletedMessage")} />
          <NoderaButton variant="filled" fullWidth onClick={() => void startThreeDS()}>
            {t("continueToBank")}
          </NoderaButton>
          {back}
        </div>
      );
    case "invalid":
      return (
        <div className="flex flex-col gap-section">
          <AuthCardHeader title={t("invalidTitle")} />
          <NoderaAlert variant="warning" message={t("invalidMessage")} />
          {back}
        </div>
      );
    default:
      return (
        <div className="flex flex-col gap-section">
          <AuthCardHeader title={t("errorTitle")} />
          <NoderaAlert variant="error" message={outcome.message} />
          {effectiveToken && (
            <NoderaButton variant="filled" fullWidth onClick={() => void check(false)}>
              {t("retry")}
            </NoderaButton>
          )}
          {back}
        </div>
      );
  }
}
