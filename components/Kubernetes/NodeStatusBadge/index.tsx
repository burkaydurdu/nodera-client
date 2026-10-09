import { LoadingOutlined } from "@ant-design/icons";
import classNames from "classnames";
import { useTranslations } from "next-intl";
import type { NodeStatus } from "@/core/kubernetesApp";
import type { NodeStatusBadgeProps } from "./type";

const statusClasses: Record<NodeStatus, string> = {
  requested: "bg-status-provisioning-soft text-status-provisioning",
  joining: "bg-status-provisioning-soft text-status-provisioning",
  ready: "bg-status-active-soft text-status-active",
  not_ready: "bg-status-deleting-soft text-status-deleting",
  releasing: "bg-status-off-soft text-status-off",
  failed: "bg-status-failed-soft text-status-failed",
};

const moving: readonly NodeStatus[] = ["requested", "joining", "releasing"];

export default function NodeStatusBadge({ status, className }: NodeStatusBadgeProps) {
  const t = useTranslations("kubernetes.nodeStatus");

  return (
    <span
      className={classNames(
        "inline-flex h-6 items-center gap-1.5 rounded-badge px-2.5 text-xs font-semibold",
        statusClasses[status] ?? statusClasses.requested,
        className
      )}
    >
      {moving.includes(status) ? (
        <LoadingOutlined spin />
      ) : (
        <span className="size-1.5 rounded-full bg-current" aria-hidden />
      )}
      {t(status)}
    </span>
  );
}
