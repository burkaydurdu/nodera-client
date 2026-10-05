"use client";

import classNames from "classnames";
import { useLocale, useTranslations } from "next-intl";
import {
  RATES_MIN_MESSAGES,
  RATE_KINDS,
  RATE_RULES,
  type RateLevel,
  rateLevel,
} from "@/core/mail";
import { formatCount, formatPercentNumber, formatPercentString } from "@/utils/number";
import Card from "@/components/Card";
import type { MailRatesCardProps } from "./type";

/** Static class map so Tailwind sees every utility; colours come from theme/tokens.ts. */
const levelClasses: Record<RateLevel, string> = {
  ok: "text-text",
  warning: "text-warning",
  danger: "text-danger",
};

/** The bounce and complaint rates of the last seven days, against the lines that act on them. */
export default function MailRatesCard({ rates }: MailRatesCardProps) {
  const t = useTranslations("mail.rates");
  const locale = useLocale();

  const rows = RATE_KINDS.map((kind) => {
    const rule = RATE_RULES[kind];
    const value = rates[rule.field];
    return {
      kind,
      value,
      level: rateLevel(value, rule),
      hint: t("limits", {
        warning: formatPercentNumber(rule.warning, locale),
        pause: formatPercentNumber(rule.pause, locale),
      }),
    };
  });

  return (
    <Card title={t("title", { days: rates.windowDays })} description={t("description")}>
      <div className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-sm text-text-muted">{t("sent")}</span>
          <span className="font-mono text-sm font-medium text-text">
            {formatCount(rates.sent, locale)}
          </span>
        </div>
        {rows.map((row) => (
          <div key={row.kind} className="flex flex-col gap-0.5">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-sm text-text-muted">{t(row.kind)}</span>
              <span
                className={classNames(
                  "font-mono text-sm font-semibold",
                  levelClasses[row.level]
                )}
              >
                {formatPercentString(row.value, locale)}
              </span>
            </div>
            <span className="text-xs text-text-muted">{row.hint}</span>
          </div>
        ))}
        {rates.sent < RATES_MIN_MESSAGES && (
          <p className="text-xs leading-4 text-text-muted">
            {t("minimum", { count: formatCount(RATES_MIN_MESSAGES, locale) })}
          </p>
        )}
      </div>
    </Card>
  );
}
