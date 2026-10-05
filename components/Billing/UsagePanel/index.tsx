"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { GetUsage } from "@/api/billing";
import { BILLING_CURRENCY, type Usage, isMailLine } from "@/core/billing";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { formatPeriodEnd, formatUtcDate } from "@/utils/date";
import { formatMoney } from "@/utils/price";
import UsageTable from "@/components/Billing/UsageTable";
import Card from "@/components/Card";
import Loading from "@/components/Loading";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import type { UsagePanelProps } from "./type";

/**
 * The Usage tab: this Period's hours per Droplet and each Project's Mail Package, the estimate
 * and the Threshold rule.
 */
export default function UsagePanel({ teamId }: UsagePanelProps) {
  const t = useTranslations("billing.usage");
  const locale = useLocale();
  const { getErrorMessage } = useErrorMessage();

  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await GetUsage(teamId);
      setUsage(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [teamId, getErrorMessage]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <Loading />;
  }

  if (error || !usage) {
    return (
      <div className="flex flex-col items-start gap-3">
        <NoderaAlert variant="error" message={error ?? t("unavailable")} className="w-full" />
        <NoderaButton variant="outlined" onClick={load}>
          {t("retry")}
        </NoderaButton>
      </div>
    );
  }

  const totals: Array<{ label: string; value: string; strong?: boolean }> = [
    { label: t("subtotal"), value: formatMoney(usage.subtotal, BILLING_CURRENCY) },
    { label: t("estimatedTax"), value: formatMoney(usage.estimatedTax, BILLING_CURRENCY) },
    {
      label: t("estimatedTotal"),
      value: formatMoney(usage.estimatedTotal, BILLING_CURRENCY),
      strong: true,
    },
  ];

  return (
    <div className="flex flex-col gap-section">
      <NoderaAlert
        variant="info"
        message={t("thresholdNote", {
          amount: formatMoney(usage.threshold.amount, BILLING_CURRENCY),
        })}
        description={usage.threshold.kind === "new" ? t("thresholdNew") : undefined}
      />
      <Card
        title={t("title")}
        description={t("description", {
          start: formatUtcDate(usage.periodStart, locale),
          end: formatPeriodEnd(usage.periodEnd, locale),
        })}
        flush
      >
        <UsageTable lines={usage.lines} currency={BILLING_CURRENCY} />
        <dl className="ml-auto flex w-full max-w-sm flex-col gap-1.5 px-6 py-5">
          {totals.map((row) => (
            <div key={row.label} className="flex items-baseline justify-between gap-4 text-sm">
              <dt className={row.strong ? "font-semibold text-text" : "text-text-muted"}>
                {row.label}
              </dt>
              <dd
                className={
                  row.strong
                    ? "font-mono text-base font-semibold text-text"
                    : "font-mono text-text"
                }
              >
                {row.value}
              </dd>
            </div>
          ))}
          <p className="pt-1 text-right text-xs text-text-muted">{t("rules")}</p>
          {usage.lines.some(isMailLine) && (
            <p className="text-right text-xs text-text-muted">{t("mailRules")}</p>
          )}
        </dl>
      </Card>
    </div>
  );
}
