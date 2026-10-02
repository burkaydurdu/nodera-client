"use client";

import { useLocale, useTranslations } from "next-intl";
import { billingPath } from "@/core/billing";
import useTeam from "@/contexts/TeamContext/useTeam";
import { useCan } from "@/hooks/Authz/useCan";
import { useBillingStatus } from "@/hooks/Billing/useBillingStatus";
import { useNavigate } from "@/hooks/Navigation/useNavigate";
import { formatDateTime } from "@/utils/date";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import type { NoderaAlertVariant } from "@/components/NoderaAlert/type";

/**
 * Dashboard-wide notice of the Team's Billing status: no card yet, a failed charge being
 * retried, or a suspension. Every member sees it; only `billing.write` gets the action, the
 * others are told whom to ask.
 */
export default function BillingStatusBanner() {
  const t = useTranslations("billing.banner");
  const locale = useLocale();
  const { currentTeam } = useTeam();
  const canWrite = useCan("billing.write");
  const { navigate } = useNavigate();
  const teamId = currentTeam?.id ?? null;
  const { status } = useBillingStatus(teamId);

  if (!status) return null;

  let variant: NoderaAlertVariant;
  let title: string;
  let text: string;
  let action: { label: string; path: string } | null = null;

  if (status.status === "suspended") {
    variant = "error";
    title = t("suspendedTitle");
    const deletion = status.deletionAt
      ? ` ${t("suspendedDeletion", { date: formatDateTime(status.deletionAt, locale) })}`
      : "";
    text = `${t("suspended")}${deletion}${canWrite ? "" : ` ${t("askToPay")}`}`;
    action = canWrite
      ? {
          label: t("payNow"),
          path: billingPath("invoices", status.openInvoiceId, teamId),
        }
      : null;
  } else if (status.status === "no_payment_method") {
    variant = "warning";
    title = t("noPaymentMethodTitle");
    text = canWrite ? t("noPaymentMethod") : t("noPaymentMethodAsk");
    action = canWrite
      ? { label: t("addCard"), path: billingPath("payment-methods", null, teamId) }
      : null;
  } else if (status.openInvoiceId && status.nextRetryAt) {
    variant = "warning";
    title = t("paymentFailedTitle");
    const date = formatDateTime(status.nextRetryAt, locale);
    text = canWrite ? t("paymentFailed", { date }) : t("paymentFailedAsk", { date });
    action = canWrite
      ? { label: t("payNow"), path: billingPath("invoices", status.openInvoiceId, teamId) }
      : null;
  } else if (status.openInvoiceId) {
    variant = "info";
    title = t("openInvoiceTitle");
    text = canWrite ? t("openInvoice") : `${t("openInvoice")} ${t("askToPay")}`;
    action = canWrite
      ? { label: t("payNow"), path: billingPath("invoices", status.openInvoiceId, teamId) }
      : null;
  } else {
    return null;
  }

  return (
    <NoderaAlert
      variant={variant}
      message={title}
      description={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span>{text}</span>
          {action && (
            <NoderaButton
              variant={variant === "error" ? "danger" : "filled"}
              size="small"
              onClick={() => navigate(action!.path)}
              className="shrink-0"
            >
              {action.label}
            </NoderaButton>
          )}
        </div>
      }
    />
  );
}
