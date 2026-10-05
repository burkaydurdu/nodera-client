"use client";

import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useLocale, useTranslations } from "next-intl";
import type { MessageRecipientSummary, MessageSummary, RecipientStatus } from "@/core/mail";
import { formatDateTime } from "@/utils/date";
import RecipientStatusBadge from "@/components/Mail/RecipientStatusBadge";
import type { MessageTableProps } from "./type";

/** Each status once, in the order the recipients first reach it. */
const distinctStatuses = (recipients: MessageRecipientSummary[]): RecipientStatus[] =>
  recipients.reduce<RecipientStatus[]>(
    (statuses, recipient) =>
      statuses.includes(recipient.status) ? statuses : [...statuses, recipient.status],
    []
  );

export default function MessageTable({
  messages,
  loading = false,
  onOpen,
}: MessageTableProps) {
  const t = useTranslations("mail.logs");
  const locale = useLocale();

  const columns: ColumnsType<MessageSummary> = [
    {
      title: t("columns.sent"),
      dataIndex: "createdAt",
      key: "sent",
      width: 170,
      render: (value: string) => (
        <span className="text-sm text-text">{formatDateTime(value, locale)}</span>
      ),
    },
    {
      title: t("columns.subject"),
      key: "subject",
      ellipsis: true,
      render: (_: unknown, message) => (
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium text-text">
            {message.subject || t("noSubject")}
          </span>
          <span className="truncate font-mono text-xs text-text-muted">{message.from}</span>
        </span>
      ),
    },
    {
      title: t("columns.recipients"),
      dataIndex: "recipients",
      key: "recipients",
      width: 230,
      ellipsis: true,
      render: (recipients: MessageRecipientSummary[]) => {
        const [first, ...rest] = recipients ?? [];
        if (!first) return null;
        return (
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="truncate font-mono text-xs text-text">{first.address}</span>
            {rest.length > 0 && (
              <span className="shrink-0 text-xs text-text-muted">
                {t("moreRecipients", { count: rest.length })}
              </span>
            )}
          </span>
        );
      },
    },
    {
      title: t("columns.status"),
      dataIndex: "recipients",
      key: "status",
      width: 200,
      render: (recipients: MessageRecipientSummary[]) => (
        <span className="flex flex-wrap gap-1">
          {distinctStatuses(recipients ?? []).map((status) => (
            <RecipientStatusBadge key={status} status={status} />
          ))}
        </span>
      ),
    },
    {
      title: t("columns.tags"),
      dataIndex: "tags",
      key: "tags",
      width: 160,
      render: (tags: string[]) => (
        <span className="flex flex-wrap gap-1">
          {(tags ?? []).map((tag) => (
            <Tag key={tag} className="m-0 rounded-badge">
              {tag}
            </Tag>
          ))}
        </span>
      ),
    },
    {
      title: t("columns.source"),
      dataIndex: "source",
      key: "source",
      width: 90,
      render: (source: string) => (
        <span className="text-xs font-semibold uppercase text-text-muted">{source}</span>
      ),
    },
  ];

  return (
    <Table<MessageSummary>
      rowKey="id"
      columns={columns}
      dataSource={messages}
      loading={loading}
      pagination={false}
      size="middle"
      locale={{ emptyText: t("empty") }}
      scroll={{ x: 1000 }}
      rowClassName={() => "cursor-pointer"}
      onRow={(message) => ({ onClick: () => onOpen(message) })}
    />
  );
}
