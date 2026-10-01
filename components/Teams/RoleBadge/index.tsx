import classNames from "classnames";
import { useTranslations } from "next-intl";
import type { TeamRole } from "@/core/user";
import type { RoleBadgeProps } from "./type";

/** Static class map so Tailwind sees every utility; colours come from theme/tokens.ts. */
const roleClasses: Record<TeamRole, string> = {
  owner: "bg-brand-50 text-brand-700",
  developer: "bg-success-soft text-success",
  finance: "bg-warning-soft text-warning",
};

export default function RoleBadge({ role, className }: RoleBadgeProps) {
  const t = useTranslations("teams.roles");

  return (
    <span
      className={classNames(
        "inline-flex h-5 items-center rounded-badge px-2 text-[11px] font-semibold uppercase tracking-wide",
        roleClasses[role] ?? roleClasses.finance,
        className
      )}
    >
      {t(role)}
    </span>
  );
}
