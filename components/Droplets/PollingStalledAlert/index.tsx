"use client";

import { useTranslations } from "next-intl";
import { MAX_POLL_FAILURES } from "@/hooks/Polling/usePolling";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import type { PollingStalledAlertProps } from "./type";

/** Shown when the live refresh gave up after repeated failures; the data on screen may be stale. */
export default function PollingStalledAlert({ onRetry }: PollingStalledAlertProps) {
  const t = useTranslations("droplets.polling");

  return (
    <div className="flex flex-col items-start gap-3">
      <NoderaAlert
        variant="warning"
        message={t("stalledTitle")}
        description={t("stalled", { count: MAX_POLL_FAILURES })}
        className="w-full"
      />
      <NoderaButton variant="outlined" size="small" onClick={onRetry}>
        {t("retry")}
      </NoderaButton>
    </div>
  );
}
