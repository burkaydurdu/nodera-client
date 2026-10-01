"use client";

import type { ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Droplet } from "@/core/droplet";
import { formatDateTime } from "@/utils/date";
import { formatUsd } from "@/utils/price";
import Card from "@/components/Card";
import PriceNote from "@/components/Catalog/PriceNote";
import DropletStatusBadge from "@/components/Droplets/DropletStatusBadge";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaCopyButton from "@/components/NoderaCopyButton";
import type { DropletOverviewProps } from "./type";

interface Row {
  label: string;
  value: ReactNode;
}

const IpValue = ({ ip, fallback }: { ip: string | null; fallback: string }) =>
  ip ? (
    <span className="flex items-center gap-1">
      <span className="font-mono text-sm text-text">{ip}</span>
      <NoderaCopyButton value={ip} />
    </span>
  ) : (
    <span className="text-sm text-text-muted">{fallback}</span>
  );

export default function DropletOverview({ droplet }: DropletOverviewProps) {
  const t = useTranslations("droplets.detail");
  const tc = useTranslations("catalog");
  const locale = useLocale();

  const rows: Row[] = [
    { label: t("status"), value: <DropletStatusBadge status={droplet.status} /> },
    { label: t("ipv4"), value: <IpValue ip={droplet.ipv4} fallback={t("notAssigned")} /> },
    { label: t("ipv6"), value: <IpValue ip={droplet.ipv6} fallback={t("notAssigned")} /> },
    {
      label: t("image"),
      value: <span className="font-mono text-sm">{droplet.imageCode}</span>,
    },
    { label: t("plan"), value: <span className="font-mono text-sm">{droplet.planCode}</span> },
    {
      label: t("region"),
      value: <span className="font-mono text-sm">{droplet.regionCode}</span>,
    },
    {
      label: t("hourlyPrice"),
      value: (
        <span className="text-sm font-semibold text-text">
          {tc("perHour", { price: formatUsd(droplet.hourlyPrice) })}
        </span>
      ),
    },
    {
      label: t("monthlyPrice"),
      value: (
        <span className="text-sm font-medium text-text">
          {tc("perMonth", { price: formatUsd(droplet.monthlyPrice) })}
        </span>
      ),
    },
    { label: t("createdAt"), value: formatDateTime(droplet.createdAt, locale) },
    {
      label: t("activeAt"),
      value: droplet.activeAt ? (
        formatDateTime(droplet.activeAt, locale)
      ) : (
        <span className="text-text-muted">{t("notYet")}</span>
      ),
    },
  ];

  return (
    <Card title={t("overviewTitle")} description={t("lockedPriceHint")}>
      <div className="flex flex-col gap-4">
        {droplet.status === "failed" && (
          <NoderaAlert
            variant="error"
            message={t("failedTitle")}
            description={droplet.failureReason || t("failedNoReason")}
          />
        )}
        <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
          {rows.map((row) => (
            <div key={row.label} className="flex flex-col gap-1">
              <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
                {row.label}
              </dt>
              <dd className="text-sm text-text">{row.value}</dd>
            </div>
          ))}
        </dl>
        <PriceNote />
      </div>
    </Card>
  );
}
