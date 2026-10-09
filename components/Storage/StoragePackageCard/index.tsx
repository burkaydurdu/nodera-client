"use client";

import { Tooltip } from "antd";
import { useLocale, useTranslations } from "next-intl";
import { formatDate, formatUtcDate } from "@/utils/date";
import { formatStorageSize } from "@/utils/number";
import { formatUsd } from "@/utils/price";
import Card from "@/components/Card";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import type { StoragePackageCardProps } from "./type";

/** The Storage's Package, and a smaller one waiting for the next Period. */
export default function StoragePackageCard({
  storage,
  canWrite,
  blocked,
  busy,
  onUndo,
}: StoragePackageCardProps) {
  const t = useTranslations("storage.package");
  const tp = useTranslations("storage.packages");
  const locale = useLocale();
  const current = storage.package;
  const scheduled = storage.scheduledChange;

  return (
    <Card title={t("title")}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-2xl font-semibold leading-8 text-text">
              {current.code}
            </span>
            <span className="text-sm text-text-muted">
              {t("size", { size: formatStorageSize(current.sizeBytes, locale) })}
            </span>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-lg font-semibold text-text">
              {t("pricePerMonth", { price: formatUsd(current.monthlyPrice) })}
            </span>
            <span className="text-xs text-text-muted">{t("taxNote")}</span>
          </div>
        </div>
        <span className="text-xs text-text-muted">
          {t("since", { date: formatDate(current.startedAt, locale) })}
        </span>
        {scheduled && (
          <NoderaAlert
            variant="info"
            message={t("changeTitle", {
              package: scheduled.code,
              // A Period turns over at midnight UTC; the day is read in UTC like an invoice's.
              date: formatUtcDate(scheduled.effectiveAt, locale),
            })}
            description={
              <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  {t("change", {
                    size: formatStorageSize(scheduled.sizeBytes, locale),
                    price: formatUsd(scheduled.monthlyPrice),
                  })}
                </span>
                {canWrite && (
                  <Tooltip title={blocked && tp(`blocked.${blocked}`)}>
                    <span className="shrink-0">
                      <NoderaButton
                        variant="outlined"
                        size="small"
                        loading={busy}
                        disabled={blocked !== null}
                        onClick={onUndo}
                      >
                        {t("undo")}
                      </NoderaButton>
                    </span>
                  </Tooltip>
                )}
              </div>
            }
          />
        )}
      </div>
    </Card>
  );
}
