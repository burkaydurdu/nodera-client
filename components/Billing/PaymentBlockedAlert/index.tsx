"use client";

import { useTranslations } from "next-intl";
import { billingPath } from "@/core/billing";
import useTeam from "@/contexts/TeamContext/useTeam";
import { useCan } from "@/hooks/Authz/useCan";
import { useBillingStatus } from "@/hooks/Billing/useBillingStatus";
import { useNavigate } from "@/hooks/Navigation/useNavigate";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import type { PaymentBlockedAlertProps } from "./type";

/** The same calls to action as the dashboard banner, where a Droplet action was refused. */
export default function PaymentBlockedAlert({ reason }: PaymentBlockedAlertProps) {
  const t = useTranslations("billing.blocked");
  const canWrite = useCan("billing.write");
  const { currentTeam } = useTeam();
  const { navigate } = useNavigate();
  // The open invoice is what "Pay now" should open; the status names it.
  const { status } = useBillingStatus(canWrite ? (currentTeam?.id ?? null) : null);
  const teamId = currentTeam?.id ?? null;

  const suspended = reason === "suspended";
  const action = !canWrite
    ? null
    : suspended
      ? { label: t("payNow"), path: billingPath("invoices", status?.openInvoiceId, teamId) }
      : { label: t("addCard"), path: billingPath("payment-methods", null, teamId) };

  return (
    <NoderaAlert
      variant={suspended ? "error" : "warning"}
      message={suspended ? t("suspendedTitle") : t("paymentMethodRequiredTitle")}
      description={
        <div className="flex flex-col items-start gap-3">
          <span>
            {suspended ? t("suspended") : t("paymentMethodRequired")}
            {!canWrite && ` ${t("ask")}`}
          </span>
          {action && (
            <NoderaButton
              variant={suspended ? "danger" : "filled"}
              size="small"
              onClick={() => navigate(action.path)}
            >
              {action.label}
            </NoderaButton>
          )}
        </div>
      }
    />
  );
}
