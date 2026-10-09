import { LoadingOutlined } from "@ant-design/icons";
import classNames from "classnames";
import { useTranslations } from "next-intl";
import type { ClusterStatus } from "@/core/kubernetesApp";
import type { ClusterStatusBadgeProps } from "./type";

/** Static class map so Tailwind sees every status utility (theme/tokens.ts `status`). */
const statusClasses: Record<ClusterStatus, string> = {
  provisioning: "bg-status-provisioning-soft text-status-provisioning",
  running: "bg-status-active-soft text-status-active",
  degraded: "bg-status-deleting-soft text-status-deleting",
  deleting: "bg-status-off-soft text-status-off",
  failed: "bg-status-failed-soft text-status-failed",
};

export default function ClusterStatusBadge({ status, className }: ClusterStatusBadgeProps) {
  const t = useTranslations("kubernetes.status");

  return (
    <span
      className={classNames(
        "inline-flex h-6 items-center gap-1.5 rounded-badge px-2.5 text-xs font-semibold",
        statusClasses[status] ?? statusClasses.provisioning,
        className
      )}
    >
      {status === "provisioning" || status === "deleting" ? (
        <LoadingOutlined spin />
      ) : (
        <span className="size-1.5 rounded-full bg-current" aria-hidden />
      )}
      {t(status)}
    </span>
  );
}
