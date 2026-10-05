"use client";

import { CheckCircleFilled } from "@ant-design/icons";
import { useLocale, useTranslations } from "next-intl";
import { TEST_MESSAGE_WAIT_MINUTES, messagePath } from "@/core/mail";
import { useTestMessage } from "@/hooks/Mail/useTestMessage";
import { formatDateTime } from "@/utils/date";
import RecipientStatusBadge from "@/components/Mail/RecipientStatusBadge";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import NoderaLink from "@/components/NoderaLink";
import type { TestMessageWatchProps } from "./type";

/** Waits for the Project's next Message and shows it arriving, then its recipients' outcome. */
export default function TestMessageWatch({ projectId }: TestMessageWatchProps) {
  const t = useTranslations("mail.testMessage");
  const locale = useLocale();
  const { phase, message, stalled, retry, restart } = useTestMessage(projectId);

  if (stalled) {
    return (
      <div className="flex flex-col items-start gap-2">
        <NoderaAlert variant="error" message={t("stalled")} className="w-full" />
        <NoderaButton variant="outlined" size="small" onClick={retry}>
          {t("retry")}
        </NoderaButton>
      </div>
    );
  }

  if (phase === "expired") {
    return (
      <div className="flex flex-col items-start gap-2">
        <NoderaAlert
          variant="info"
          message={t("expired", { minutes: TEST_MESSAGE_WAIT_MINUTES })}
          description={t("expiredHint")}
          className="w-full"
        />
        <NoderaButton variant="outlined" size="small" onClick={restart}>
          {t("keepWaiting")}
        </NoderaButton>
      </div>
    );
  }

  if (phase === "waiting" || !message) {
    return (
      <div
        className="flex items-start gap-3 rounded-input border border-dashed border-border px-3 py-3"
        role="status"
      >
        <span className="relative mt-1.5 flex size-2.5 shrink-0" aria-hidden>
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
          <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
        </span>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-text">{t("waiting")}</span>
          <span className="text-xs leading-4 text-text-muted">{t("waitingHint")}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-3 rounded-input border border-border px-3 py-3"
      role="status"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-sm font-semibold text-success">
          <CheckCircleFilled aria-hidden />
          {t("received")}
        </span>
        <span className="text-xs text-text-muted">
          {formatDateTime(message.createdAt, locale)}
        </span>
      </div>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-sm font-medium text-text">
          {message.subject || t("noSubject")}
        </span>
        <span className="truncate text-xs text-text-muted">
          {t("from", { from: message.from })}
        </span>
      </div>
      <ul className="flex flex-col gap-1.5">
        {message.recipients.map((recipient) => (
          <li key={recipient.address} className="flex items-center justify-between gap-3">
            <span className="min-w-0 truncate font-mono text-xs text-text">
              {recipient.address}
            </span>
            <RecipientStatusBadge status={recipient.status} />
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <NoderaLink href={messagePath(projectId, message.id)}>{t("openInLogs")}</NoderaLink>
        <NoderaButton variant="text" size="small" onClick={restart}>
          {t("watchAgain")}
        </NoderaButton>
      </div>
    </div>
  );
}
