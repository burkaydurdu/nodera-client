"use client";

import { useLocale, useTranslations } from "next-intl";
import { formatDateTime, formatUtcDate } from "@/utils/date";
import { formatCount } from "@/utils/number";
import Card from "@/components/Card";
import UsageMeter from "@/components/Mail/UsageMeter";
import type { MailUsageCardProps } from "./type";

/** This Period's allowance and today's Daily limit, each with when it starts over. */
export default function MailUsageCard({ overview }: MailUsageCardProps) {
  const t = useTranslations("mail.usage");
  const locale = useLocale();
  const { period, dailyLimit } = overview;

  return (
    <Card title={t("title")} description={t("description")}>
      <div className="flex flex-col gap-6">
        {period ? (
          <UsageMeter
            label={t("periodLabel")}
            value={t("usedOf", {
              used: formatCount(period.used, locale),
              total: formatCount(period.allowance, locale),
            })}
            used={period.used}
            total={period.allowance}
            footnote={t("renews", { date: formatUtcDate(period.end, locale) })}
          />
        ) : (
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-text">{t("periodLabel")}</span>
            <span className="text-sm text-text-muted">{t("noPeriod")}</span>
          </div>
        )}
        <UsageMeter
          label={t("dailyLabel")}
          value={t("usedOf", {
            used: formatCount(dailyLimit.used, locale),
            total: formatCount(dailyLimit.limit, locale),
          })}
          used={dailyLimit.used}
          total={dailyLimit.limit}
          footnote={
            <>
              {t("resets", { date: formatDateTime(dailyLimit.resetsAt, locale) })}{" "}
              {t("dailyRule")}
            </>
          }
        />
      </div>
    </Card>
  );
}
