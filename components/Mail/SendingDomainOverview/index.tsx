"use client";

import { useLocale, useTranslations } from "next-intl";
import { formatDateTime } from "@/utils/date";
import Card from "@/components/Card";
import SendingDomainStatusBadge from "@/components/Mail/SendingDomainStatusBadge";
import type { SendingDomainOverviewProps } from "./type";

/** Where a Sending domain stands, in words, and when it was last checked. */
export default function SendingDomainOverview({ domain }: SendingDomainOverviewProps) {
  const t = useTranslations("mail.domains.detail");
  const locale = useLocale();

  const facts = [
    { key: "added", label: t("added"), value: formatDateTime(domain.createdAt, locale) },
    {
      key: "lastChecked",
      label: t("lastChecked"),
      value: domain.lastCheckedAt ? formatDateTime(domain.lastCheckedAt, locale) : t("notYet"),
    },
    {
      key: "verified",
      label: t("verifiedAt"),
      value: domain.verifiedAt ? formatDateTime(domain.verifiedAt, locale) : t("notYet"),
    },
  ];

  return (
    <Card>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
          <SendingDomainStatusBadge status={domain.status} className="shrink-0" />
          <p className="text-sm leading-5 text-text">
            {t(`explanation.${domain.status}`, { domain: domain.name })}
          </p>
        </div>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
          {facts.map((fact) => (
            <div key={fact.key} className="flex flex-col gap-0.5">
              <dt className="text-xs text-text-muted">{fact.label}</dt>
              <dd className="font-medium text-text">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Card>
  );
}
