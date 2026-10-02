import classNames from "classnames";
import { useTranslations } from "next-intl";
import type { InvoiceStatus } from "@/core/billing";
import type { InvoiceStatusBadgeProps } from "./type";

/** Static class map so Tailwind sees every utility (theme/tokens.ts `status`). */
const statusClasses: Record<InvoiceStatus, string> = {
  issued: "bg-status-provisioning-soft text-status-provisioning",
  paid: "bg-status-active-soft text-status-active",
  payment_failed: "bg-status-failed-soft text-status-failed",
  void: "bg-status-off-soft text-status-off",
};

export default function InvoiceStatusBadge({ status, className }: InvoiceStatusBadgeProps) {
  const t = useTranslations("billing.invoices.status");

  return (
    <span
      className={classNames(
        "inline-flex h-6 items-center gap-1.5 rounded-badge px-2.5 text-xs font-semibold",
        statusClasses[status] ?? statusClasses.void,
        className
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {t(status)}
    </span>
  );
}
