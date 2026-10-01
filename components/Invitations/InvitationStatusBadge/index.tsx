import classNames from "classnames";
import { useTranslations } from "next-intl";
import type { InvitationStatus } from "@/core/invitation";
import type { InvitationStatusBadgeProps } from "./type";

/** Static class map so Tailwind sees every utility (theme/tokens.ts `status`). */
const statusClasses: Record<InvitationStatus, string> = {
  pending: "bg-status-provisioning-soft text-status-provisioning",
  accepted: "bg-status-active-soft text-status-active",
  declined: "bg-status-off-soft text-status-off",
  revoked: "bg-status-failed-soft text-status-failed",
  expired: "bg-status-deleting-soft text-status-deleting",
};

export default function InvitationStatusBadge({
  status,
  className,
}: InvitationStatusBadgeProps) {
  const t = useTranslations("invitations.status");

  return (
    <span
      className={classNames(
        "inline-flex h-6 items-center gap-1.5 rounded-badge px-2.5 text-xs font-semibold",
        statusClasses[status] ?? statusClasses.declined,
        className
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {t(status)}
    </span>
  );
}
