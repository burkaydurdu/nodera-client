import { LoadingOutlined } from "@ant-design/icons";
import classNames from "classnames";
import { useTranslations } from "next-intl";
import type { WebhookDeliveryStatus } from "@/core/mail";
import type { WebhookDeliveryStatusBadgeProps } from "./type";

/** Static class map so Tailwind sees every utility (theme/tokens.ts `status`). */
const statusClasses: Record<WebhookDeliveryStatus, string> = {
  pending: "bg-status-provisioning-soft text-status-provisioning",
  succeeded: "bg-status-active-soft text-status-active",
  failed: "bg-status-failed-soft text-status-failed",
};

export default function WebhookDeliveryStatusBadge({
  status,
  className,
}: WebhookDeliveryStatusBadgeProps) {
  const t = useTranslations("mail.webhooks.deliveryStatus");

  return (
    <span
      className={classNames(
        "inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-badge px-2.5 text-xs font-semibold",
        statusClasses[status] ?? statusClasses.pending,
        className
      )}
    >
      {status === "pending" ? (
        <LoadingOutlined spin />
      ) : (
        <span className="size-1.5 rounded-full bg-current" aria-hidden />
      )}
      {t(status)}
    </span>
  );
}
