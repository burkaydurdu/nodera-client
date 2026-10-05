"use client";

import { useLocale, useTranslations } from "next-intl";
import { RATE_RULES, pausedRate } from "@/core/mail";
import { formatDateTime } from "@/utils/date";
import { formatPercentNumber, formatPercentString } from "@/utils/number";
import NoderaAlert from "@/components/NoderaAlert";
import type { MailPauseAlertProps } from "./type";

/** Nodera stopped the Project's sending over its bounce or complaint rate; only it lifts this. */
export default function MailPauseAlert({ pause, rates }: MailPauseAlertProps) {
  const t = useTranslations("mail.pause");
  const locale = useLocale();
  const rateKind = pausedRate(pause.reason);

  return (
    <NoderaAlert
      variant="error"
      message={t("title", { date: formatDateTime(pause.pausedAt, locale) })}
      description={
        <span className="flex flex-col gap-1">
          {rateKind && (
            <span>
              {t(rateKind, {
                rate: formatPercentString(rates[RATE_RULES[rateKind].field], locale),
                limit: formatPercentNumber(RATE_RULES[rateKind].pause, locale),
                days: rates.windowDays,
              })}
            </span>
          )}
          <span>{t("lift")}</span>
        </span>
      }
    />
  );
}
