import classNames from "classnames";
import { useTranslations } from "next-intl";
import { type RecipientStatus, isMessageEventType } from "@/core/mail";
import type { RecipientStatusBadgeProps } from "./type";

/** Static class map so Tailwind sees every utility (theme/tokens.ts `status`). */
const recipientStatusClasses: Record<RecipientStatus, string> = {
  accepted: "bg-status-provisioning-soft text-status-provisioning",
  delivered: "bg-status-active-soft text-status-active",
  deferred: "bg-status-deleting-soft text-status-deleting",
  bounced: "bg-status-failed-soft text-status-failed",
  suppressed: "bg-status-off-soft text-status-off",
  complained: "bg-status-failed-soft text-status-failed",
};

export default function RecipientStatusBadge({
  status,
  className,
}: RecipientStatusBadgeProps) {
  const t = useTranslations("mail.events");
  // A type the service adds before this build learns it reads as given, in neutral colours.
  const known = isMessageEventType(status);

  return (
    <span
      className={classNames(
        "inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-badge px-2.5 text-xs font-semibold",
        known ? recipientStatusClasses[status] : recipientStatusClasses.suppressed,
        className
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {known ? t(status) : status}
    </span>
  );
}
