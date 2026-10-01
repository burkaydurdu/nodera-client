import { LoadingOutlined } from "@ant-design/icons";
import classNames from "classnames";
import { useTranslations } from "next-intl";
import { type DropletStatus, isTransitional } from "@/core/droplet";
import type { DropletStatusBadgeProps } from "./type";

/** Static class map so Tailwind sees every status utility (theme/tokens.ts `status`). */
const statusClasses: Record<DropletStatus, string> = {
  provisioning: "bg-status-provisioning-soft text-status-provisioning",
  active: "bg-status-active-soft text-status-active",
  off: "bg-status-off-soft text-status-off",
  failed: "bg-status-failed-soft text-status-failed",
  deleting: "bg-status-deleting-soft text-status-deleting",
  deleted: "bg-status-off-soft text-status-off",
};

export default function DropletStatusBadge({ status, className }: DropletStatusBadgeProps) {
  const t = useTranslations("droplets.status");

  return (
    <span
      className={classNames(
        "inline-flex h-6 items-center gap-1.5 rounded-badge px-2.5 text-xs font-semibold",
        statusClasses[status],
        className
      )}
    >
      {isTransitional(status) ? (
        <LoadingOutlined spin />
      ) : (
        <span className="size-1.5 rounded-full bg-current" aria-hidden />
      )}
      {t(status)}
    </span>
  );
}
