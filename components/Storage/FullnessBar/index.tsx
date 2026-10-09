"use client";

import { Progress, theme } from "antd";
import { useLocale, useTranslations } from "next-intl";
import { NEARLY_FULL_PERCENT, fullnessPercent } from "@/core/storageApp";
import { formatStorageSize } from "@/utils/number";
import type { FullnessBarProps } from "./type";

/** How full a Storage is: brand while there is room, warning from 80%, danger when full. */
export default function FullnessBar({
  usedBytes,
  sizeBytes,
  label,
  footnote,
  compact = false,
}: FullnessBarProps) {
  const t = useTranslations("storage.fullness");
  const locale = useLocale();
  const { token } = theme.useToken();
  const percent = fullnessPercent(usedBytes, sizeBytes);
  const full = sizeBytes > 0 ? usedBytes >= sizeBytes : usedBytes > 0;
  const figure = t("usedOf", {
    used: formatStorageSize(usedBytes, locale),
    total: formatStorageSize(sizeBytes, locale),
  });

  const bar = (
    <Progress
      percent={percent}
      showInfo={false}
      size={compact ? "small" : "default"}
      status={full ? "exception" : "normal"}
      strokeColor={!full && percent >= NEARLY_FULL_PERCENT ? token.colorWarning : undefined}
    />
  );

  if (compact) {
    return (
      <div className="flex min-w-32 flex-col gap-0.5">
        {bar}
        <span className="text-xs text-text-muted">{figure}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm font-medium text-text">{label ?? t("label")}</span>
        <span className="font-mono text-sm text-text">{figure}</span>
      </div>
      {bar}
      {footnote && <span className="text-xs leading-4 text-text-muted">{footnote}</span>}
    </div>
  );
}
