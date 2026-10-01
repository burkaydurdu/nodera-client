"use client";

import { Tag } from "antd";
import { useLocale, useTranslations } from "next-intl";
import useTeam from "@/contexts/TeamContext/useTeam";
import Card from "@/components/Card";
import { formatDate } from "@/utils/date";
import type { ProfileSummaryProps } from "./type";

const statusColor = {
  active: "green",
  pending_verification: "gold",
  suspended: "red",
} as const;

export default function ProfileSummary({ user }: ProfileSummaryProps) {
  const t = useTranslations("profile.summary");
  const locale = useLocale();
  const { currentTeam } = useTeam();

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: t("email"), value: user.email },
    {
      label: t("status"),
      value: <Tag color={statusColor[user.status]}>{t(`statusValue.${user.status}`)}</Tag>,
    },
    { label: t("team"), value: currentTeam?.name ?? user.team?.name ?? "" },
    { label: t("memberSince"), value: formatDate(user.createdAt, locale) },
  ];

  return (
    <Card title={t("title")}>
      <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-1">
            <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
              {row.label}
            </dt>
            <dd className="text-sm text-text">{row.value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
