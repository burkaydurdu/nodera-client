"use client";

import { Timeline } from "antd";
import classNames from "classnames";
import { useLocale, useTranslations } from "next-intl";
import type { DropletStatus } from "@/core/droplet";
import { formatDateTime } from "@/utils/date";
import Card from "@/components/Card";
import type { DropletTimelineProps } from "./type";

/** Static map so Tailwind emits every status colour (theme/tokens.ts `status`). */
const dotClasses: Record<DropletStatus, string> = {
  provisioning: "bg-status-provisioning",
  active: "bg-status-active",
  off: "bg-status-off",
  failed: "bg-status-failed",
  deleting: "bg-status-deleting",
  deleted: "bg-status-off",
};

export default function DropletTimeline({ history }: DropletTimelineProps) {
  const t = useTranslations("droplets.detail");
  const ts = useTranslations("droplets.status");
  const locale = useLocale();

  // Newest first so the current status is read without scrolling.
  const ordered = [...history].sort((a, b) => Date.parse(b.at) - Date.parse(a.at));

  return (
    <Card title={t("timelineTitle")} description={t("timelineDescription")}>
      {ordered.length === 0 ? (
        <p className="text-sm text-text-muted">{t("timelineEmpty")}</p>
      ) : (
        <Timeline
          className="mt-2"
          items={ordered.map((transition, index) => ({
            key: `${transition.at}-${index}`,
            icon: (
              <span
                className={classNames(
                  "block size-2.5 rounded-full",
                  dotClasses[transition.to] ?? dotClasses.off
                )}
                aria-hidden
              />
            ),
            content: (
              <div className="flex flex-col gap-0.5 pb-2">
                <span className="text-sm font-medium text-text">
                  {transition.from
                    ? t("transition", { from: ts(transition.from), to: ts(transition.to) })
                    : ts(transition.to)}
                </span>
                <span className="text-xs text-text-muted">
                  {formatDateTime(transition.at, locale)}
                </span>
                {transition.reason && (
                  <span className="text-xs text-text-muted">{transition.reason}</span>
                )}
              </div>
            ),
          }))}
        />
      )}
    </Card>
  );
}
