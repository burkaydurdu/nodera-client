"use client";

import { Timeline } from "antd";
import classNames from "classnames";
import { useLocale, useTranslations } from "next-intl";
import { type MessageEventType, type SmtpResponse, isMessageEventType } from "@/core/mail";
import { formatDateTime } from "@/utils/date";
import type { MessageEventTimelineProps } from "./type";

/** Static map so Tailwind emits every status colour (theme/tokens.ts `status`). */
const dotClasses: Record<MessageEventType, string> = {
  accepted: "bg-status-provisioning",
  delivered: "bg-status-active",
  deferred: "bg-status-deleting",
  bounced: "bg-status-failed",
  suppressed: "bg-status-off",
  complained: "bg-status-failed",
};

/** The receiving server's answer as it said it: code, enhanced code, text. */
const responseLine = (response: SmtpResponse): string =>
  [response.code, response.enhancedCode, response.text]
    .filter((part) => part !== null && part !== undefined && part !== "")
    .join(" ");

/** What happened to one recipient, oldest first, with each answer of the receiving server. */
export default function MessageEventTimeline({ events }: MessageEventTimelineProps) {
  const t = useTranslations("mail.logs.detail");
  const te = useTranslations("mail.events");
  const locale = useLocale();

  const ordered = [...events].sort(
    (a, b) => Date.parse(a.occurredAt) - Date.parse(b.occurredAt)
  );

  if (ordered.length === 0) {
    return <p className="text-sm text-text-muted">{t("noEvents")}</p>;
  }

  return (
    <Timeline
      className="mt-2"
      items={ordered.map((event, index) => {
        const known = isMessageEventType(event.type);
        const answer = event.response ? responseLine(event.response) : "";
        return {
          key: `${event.type}-${event.occurredAt}-${index}`,
          icon: (
            <span
              className={classNames(
                "block size-2.5 rounded-full",
                known ? dotClasses[event.type] : dotClasses.suppressed
              )}
              aria-hidden
            />
          ),
          content: (
            <div className="flex flex-col gap-0.5 pb-2">
              <span className="text-sm font-medium text-text">
                {known ? te(event.type) : event.type}
              </span>
              <span className="text-xs text-text-muted">
                {formatDateTime(event.occurredAt, locale)}
              </span>
              {answer && (
                <span className="break-words rounded-input bg-surface-raised px-2 py-1 font-mono text-xs text-text">
                  {answer}
                </span>
              )}
            </div>
          ),
        };
      })}
    />
  );
}
