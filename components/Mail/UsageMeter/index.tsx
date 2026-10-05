"use client";

import { Progress, theme } from "antd";
import { usagePercent } from "@/core/mail";
import type { UsageMeterProps } from "./type";

/** The share at which a meter turns to the warning colour, as the 80% notification does. */
const NEAR_LIMIT_PERCENT = 80;

/** A used-of-total bar: brand while there is room, warning near the end, danger when full. */
export default function UsageMeter({ label, value, used, total, footnote }: UsageMeterProps) {
  const { token } = theme.useToken();
  const percent = usagePercent(used, total);
  const full = total > 0 ? used >= total : used > 0;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm font-medium text-text">{label}</span>
        <span className="font-mono text-sm text-text">{value}</span>
      </div>
      <Progress
        percent={percent}
        showInfo={false}
        status={full ? "exception" : "normal"}
        strokeColor={!full && percent >= NEAR_LIMIT_PERCENT ? token.colorWarning : undefined}
      />
      {footnote && <span className="text-xs leading-4 text-text-muted">{footnote}</span>}
    </div>
  );
}
