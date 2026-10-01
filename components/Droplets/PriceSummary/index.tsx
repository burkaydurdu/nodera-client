"use client";

import { useTranslations } from "next-intl";
import { formatUsd } from "@/utils/price";
import Card from "@/components/Card";
import PriceNote from "@/components/Catalog/PriceNote";
import type { PriceSummaryProps } from "./type";

export default function PriceSummary({
  region,
  plan,
  image,
  hostname,
  keyCount,
}: PriceSummaryProps) {
  const t = useTranslations("droplets.create.summary");
  const tc = useTranslations("catalog");
  const dash = "—";

  const rows: Array<[string, string]> = [
    [t("region"), region ? `${region.city}, ${region.country}` : dash],
    [t("plan"), plan?.code ?? dash],
    [t("image"), image?.name ?? dash],
    [t("hostname"), hostname || dash],
    [t("sshKeys"), keyCount > 0 ? String(keyCount) : dash],
  ];

  return (
    <Card title={t("title")} className="lg:sticky lg:top-24">
      <dl className="flex flex-col gap-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-4 text-sm">
            <dt className="text-text-muted">{label}</dt>
            <dd className="truncate text-right font-medium text-text">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-5 flex flex-col gap-1 border-t border-border pt-4">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-sm text-text-muted">{t("hourly")}</span>
          <span className="text-xl font-semibold text-text">
            {plan ? tc("perHour", { price: formatUsd(plan.hourlyPrice) }) : dash}
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-sm text-text-muted">{t("monthly")}</span>
          <span className="text-sm font-medium text-text">
            {plan ? tc("perMonth", { price: formatUsd(plan.monthlyPrice) }) : dash}
          </span>
        </div>
        <div className="pt-2">
          <PriceNote />
        </div>
      </div>
    </Card>
  );
}
