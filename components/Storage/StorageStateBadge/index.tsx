import { LoadingOutlined } from "@ant-design/icons";
import classNames from "classnames";
import { useTranslations } from "next-intl";
import type { StorageState } from "@/core/storageApp";
import type { StorageStateBadgeProps } from "./type";

/** Static class map so Tailwind sees every status utility (theme/tokens.ts `status`). */
const stateClasses: Record<StorageState, string> = {
  active: "bg-status-active-soft text-status-active",
  full: "bg-status-deleting-soft text-status-deleting",
  paused: "bg-status-failed-soft text-status-failed",
  suspended: "bg-status-failed-soft text-status-failed",
  deleting: "bg-status-off-soft text-status-off",
};

export default function StorageStateBadge({ state, className }: StorageStateBadgeProps) {
  const t = useTranslations("storage.state");

  return (
    <span
      className={classNames(
        "inline-flex h-6 items-center gap-1.5 rounded-badge px-2.5 text-xs font-semibold",
        stateClasses[state] ?? stateClasses.active,
        className
      )}
    >
      {state === "deleting" ? (
        <LoadingOutlined spin />
      ) : (
        <span className="size-1.5 rounded-full bg-current" aria-hidden />
      )}
      {t(state)}
    </span>
  );
}
