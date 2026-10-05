import classNames from "classnames";
import { useTranslations } from "next-intl";
import type { SendingDomainStatus } from "@/core/mail";
import type { SendingDomainStatusBadgeProps } from "./type";

/** Static class map so Tailwind sees every utility (theme/tokens.ts `status`). */
const statusClasses: Record<SendingDomainStatus, string> = {
  pending: "bg-status-provisioning-soft text-status-provisioning",
  verified: "bg-status-active-soft text-status-active",
  unverified: "bg-status-failed-soft text-status-failed",
};

export default function SendingDomainStatusBadge({
  status,
  className,
}: SendingDomainStatusBadgeProps) {
  const t = useTranslations("mail.domains.status");

  return (
    <span
      className={classNames(
        "inline-flex h-6 items-center gap-1.5 rounded-badge px-2.5 text-xs font-semibold",
        statusClasses[status] ?? statusClasses.pending,
        className
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {t(status)}
    </span>
  );
}
