"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { CompleteCardVerification } from "@/api/billing";
import { CARD_ADDED_PARAM, billingPath, notifyBillingStatusChanged } from "@/core/billing";
import { clearPendingCardVerification, getPendingCardVerification } from "@/core/storage";
import useTeam from "@/contexts/TeamContext/useTeam";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { useNavigate } from "@/hooks/Navigation/useNavigate";
import { IsRetryableError } from "@/utils/error";
import AuthCardHeader from "@/components/Auth/AuthCardHeader";
import Loading from "@/components/Loading";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import type { CardVerificationCompleteCardProps } from "./type";

interface Failure {
  message: string;
  /** No answer or a server failure: the same verification may still complete. */
  retryable: boolean;
}

/**
 * The provider's return page: completes the verification for the Team that started it and
 * goes back to that Team's cards. The Team stashed before the redirect is trusted only for the
 * same verification; any other return falls back to the selected Team.
 */
export default function CardVerificationCompleteCard({
  verificationId,
  callback,
}: CardVerificationCompleteCardProps) {
  const t = useTranslations("billing.cardComplete");
  const { currentTeam, teams, isLoading: teamsLoading, selectTeam } = useTeam();
  const { navigate } = useNavigate();
  const { getErrorMessage } = useErrorMessage();
  const [failure, setFailure] = useState<Failure | null>(null);
  // The completion is not idempotent on the provider's side: one call at a time per page,
  // whatever re-renders or Team loads happen meanwhile.
  const inFlight = useRef(false);
  const [attempt, setAttempt] = useState(0);

  const pending = getPendingCardVerification();
  const stashed = pending && pending.verificationId === verificationId ? pending : null;
  const teamId = stashed?.teamId ?? currentTeam?.id ?? null;
  const cardsPath = billingPath("payment-methods");

  const complete = useCallback(async () => {
    if (!verificationId || !teamId || inFlight.current) return;
    inFlight.current = true;
    setFailure(null);
    try {
      const response = await CompleteCardVerification(teamId, { verificationId, callback });
      clearPendingCardVerification();
      // The card belongs to the Team that started the flow: show it, not the selected one.
      if (teams.some((team) => team.id === teamId)) selectTeam(teamId);
      notifyBillingStatusChanged();
      navigate(`${cardsPath}&${CARD_ADDED_PARAM}=${encodeURIComponent(response.data.last4)}`, {
        replace: true,
      });
    } catch (err) {
      const retryable = IsRetryableError(err);
      // A refusal is final for this verification; only an unanswered call keeps the stash
      // so that "Try again" completes the same one.
      if (!retryable) clearPendingCardVerification();
      setFailure({ message: getErrorMessage(err), retryable });
      inFlight.current = false;
    }
  }, [
    verificationId,
    teamId,
    callback,
    teams,
    selectTeam,
    navigate,
    cardsPath,
    getErrorMessage,
  ]);

  useEffect(() => {
    if (attempt > 0 || failure) return;
    if (!verificationId) {
      setFailure({ message: t("missingParams"), retryable: false });
      return;
    }
    // Wait for the Team list: the stashed Team is selected from it once the card is saved.
    if (teamsLoading) return;
    if (!teamId) {
      setFailure({ message: t("noTeam"), retryable: false });
      return;
    }
    setAttempt(1);
    void complete();
  }, [verificationId, teamId, teamsLoading]);

  const retry = () => {
    setAttempt((count) => count + 1);
    void complete();
  };

  if (failure) {
    return (
      <div className="flex flex-col gap-section">
        <AuthCardHeader title={t("failedTitle")} />
        <NoderaAlert variant="error" message={failure.message} />
        <div className="flex flex-col gap-3">
          {failure.retryable && (
            <NoderaButton variant="filled" fullWidth onClick={retry}>
              {t("retry")}
            </NoderaButton>
          )}
          <NoderaButton
            variant={failure.retryable ? "outlined" : "filled"}
            fullWidth
            onClick={() => navigate(cardsPath)}
          >
            {t("backToCards")}
          </NoderaButton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-section">
      <AuthCardHeader title={t("title")} subtitle={t("description")} />
      <Loading />
    </div>
  );
}
