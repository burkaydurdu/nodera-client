"use client";

import { useLocale, useTranslations } from "next-intl";
import { formatDateTime } from "@/utils/date";
import { formatCount, formatStorageSize } from "@/utils/number";
import Card from "@/components/Card";
import FullnessBar from "@/components/Storage/FullnessBar";
import type { StorageSizeCardProps } from "./type";

/** How much the Storage holds of its Package right now, and when that was last measured. */
export default function StorageSizeCard({ storage }: StorageSizeCardProps) {
  const t = useTranslations("storage.usage");
  const locale = useLocale();

  return (
    <Card title={t("sizeTitle")} description={t("sizeDescription")}>
      <div className="flex flex-col gap-4">
        <FullnessBar
          usedBytes={storage.usedBytes}
          sizeBytes={storage.package.sizeBytes}
          footnote={
            storage.measuredAt
              ? t("measuredAt", { date: formatDateTime(storage.measuredAt, locale) })
              : t("notMeasured")
          }
        />
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs text-text-muted">{t("objects")}</dt>
            <dd className="font-mono text-text">{formatCount(storage.objectCount, locale)}</dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs text-text-muted">{t("package")}</dt>
            <dd className="font-mono text-text">
              {storage.package.code} · {formatStorageSize(storage.package.sizeBytes, locale)}
            </dd>
          </div>
        </dl>
      </div>
    </Card>
  );
}
