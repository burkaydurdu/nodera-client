"use client";

import { useCallback, useEffect, useState } from "react";
import { Drawer, Tag } from "antd";
import { useLocale, useTranslations } from "next-intl";
import { GetMessage } from "@/api/mail";
import type { MessageDetail } from "@/core/mail";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { formatDateTime } from "@/utils/date";
import { formatBytes } from "@/utils/number";
import FormSection from "@/components/FormSection";
import Loading from "@/components/Loading";
import MessageEventTimeline from "@/components/Mail/MessageEventTimeline";
import RecipientStatusBadge from "@/components/Mail/RecipientStatusBadge";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import NoderaCopyButton from "@/components/NoderaCopyButton";
import type { MessageDetailDrawerProps } from "./type";

/** One Message: its headers as Nodera kept them and each recipient's Message events. */
export default function MessageDetailDrawer({
  projectId,
  messageId,
  onClose,
}: MessageDetailDrawerProps) {
  const t = useTranslations("mail.logs.detail");
  const locale = useLocale();
  const { getErrorMessage } = useErrorMessage();

  const [message, setMessage] = useState<MessageDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!messageId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await GetMessage(projectId, messageId);
      setMessage(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [projectId, messageId, getErrorMessage]);

  useEffect(() => {
    setMessage(null);
    load();
  }, [projectId, messageId]);

  const facts = message
    ? [
        { key: "from", label: t("from"), value: message.from, mono: true },
        { key: "sent", label: t("sent"), value: formatDateTime(message.createdAt, locale) },
        { key: "source", label: t("source"), value: t(`sources.${message.source}`) },
        { key: "size", label: t("size"), value: formatBytes(message.sizeBytes, locale) },
      ]
    : [];

  return (
    <Drawer
      open={!!messageId}
      onClose={onClose}
      title={message?.subject || t("title")}
      width={720}
      destroyOnHidden
    >
      {loading || (!message && !error) ? (
        <Loading />
      ) : error || !message ? (
        <div className="flex flex-col items-start gap-3">
          <NoderaAlert variant="error" message={error ?? t("notFound")} className="w-full" />
          <NoderaButton variant="outlined" size="small" onClick={load}>
            {t("retry")}
          </NoderaButton>
        </div>
      ) : (
        <div className="flex flex-col gap-section">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            {facts.map((fact) => (
              <div key={fact.key} className="flex min-w-0 flex-col gap-0.5">
                <dt className="text-xs text-text-muted">{fact.label}</dt>
                <dd
                  className={
                    fact.mono
                      ? "break-all font-mono text-sm text-text"
                      : "font-medium text-text"
                  }
                >
                  {fact.value}
                </dd>
              </div>
            ))}
            <div className="flex min-w-0 flex-col gap-0.5 sm:col-span-2">
              <dt className="text-xs text-text-muted">{t("messageIdHeader")}</dt>
              <dd className="flex min-w-0 items-center gap-1">
                <span className="break-all font-mono text-xs text-text">
                  {message.messageIdHeader}
                </span>
                {message.messageIdHeader && (
                  <NoderaCopyButton value={message.messageIdHeader} />
                )}
              </dd>
            </div>
            {message.tags?.length > 0 && (
              <div className="flex flex-col gap-1 sm:col-span-2">
                <dt className="text-xs text-text-muted">{t("tags")}</dt>
                <dd className="flex flex-wrap gap-1">
                  {message.tags.map((tag) => (
                    <Tag key={tag} className="m-0 rounded-badge">
                      {tag}
                    </Tag>
                  ))}
                </dd>
              </div>
            )}
          </dl>

          <FormSection title={t("recipientsTitle")} description={t("recipientsDescription")}>
            <div className="flex flex-col gap-4">
              {(message.recipients ?? []).map((recipient) => (
                <div
                  key={`${recipient.kind}:${recipient.address}`}
                  className="flex flex-col gap-2 rounded-card border border-border p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="text-xs font-semibold uppercase text-text-muted">
                        {t(`kinds.${recipient.kind}`)}
                      </span>
                      <span className="break-all font-mono text-sm text-text">
                        {recipient.address}
                      </span>
                    </span>
                    <RecipientStatusBadge status={recipient.status} />
                  </div>
                  <MessageEventTimeline events={recipient.events ?? []} />
                </div>
              ))}
            </div>
          </FormSection>
          <p className="text-xs leading-4 text-text-muted">{t("retention")}</p>
        </div>
      )}
    </Drawer>
  );
}
