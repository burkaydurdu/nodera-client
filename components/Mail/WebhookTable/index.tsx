"use client";

import { Switch, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useLocale, useTranslations } from "next-intl";
import { MESSAGE_EVENT_TYPES, type MessageEventType, type Webhook } from "@/core/mail";
import { formatDateTime } from "@/utils/date";
import NoderaButton from "@/components/NoderaButton";
import type { WebhookTableProps } from "./type";

export default function WebhookTable({
  webhooks,
  canWrite,
  busyId = null,
  onToggle,
  onEdit,
  onDelete,
  onDeliveries,
}: WebhookTableProps) {
  const t = useTranslations("mail.webhooks");
  const te = useTranslations("mail.events");
  const locale = useLocale();

  const columns: ColumnsType<Webhook> = [
    {
      title: t("columns.url"),
      dataIndex: "url",
      key: "url",
      ellipsis: true,
      render: (url: string) => <span className="font-mono text-sm text-text">{url}</span>,
    },
    {
      title: t("columns.events"),
      dataIndex: "events",
      key: "events",
      width: 260,
      render: (events: MessageEventType[]) =>
        (events ?? []).length === MESSAGE_EVENT_TYPES.length ? (
          <span className="text-sm text-text">{t("allEvents")}</span>
        ) : (
          <span className="flex flex-wrap gap-1">
            {(events ?? []).map((event) => (
              <Tag key={event} className="m-0 rounded-badge">
                {te(event)}
              </Tag>
            ))}
          </span>
        ),
    },
    {
      title: t("columns.active"),
      dataIndex: "active",
      key: "active",
      width: 110,
      render: (active: boolean, webhook) =>
        canWrite ? (
          <Switch
            checked={active}
            loading={busyId === webhook.id}
            onChange={(checked) => onToggle(webhook, checked)}
            aria-label={active ? t("disable") : t("enable")}
          />
        ) : (
          <span className="text-sm text-text">{active ? t("activeOn") : t("activeOff")}</span>
        ),
    },
    {
      title: t("columns.created"),
      dataIndex: "createdAt",
      key: "created",
      width: 170,
      render: (value: string) => formatDateTime(value, locale),
    },
    {
      title: "",
      key: "actions",
      width: canWrite ? 260 : 120,
      align: "right",
      render: (_: unknown, webhook) => (
        <span className="flex justify-end gap-1">
          <NoderaButton variant="text" size="small" onClick={() => onDeliveries(webhook)}>
            {t("viewDeliveries")}
          </NoderaButton>
          {canWrite && (
            <>
              <NoderaButton
                variant="text"
                size="small"
                onClick={() => onEdit(webhook)}
                disabled={busyId === webhook.id}
              >
                {t("edit")}
              </NoderaButton>
              <NoderaButton
                variant="text"
                size="small"
                onClick={() => onDelete(webhook)}
                disabled={busyId === webhook.id}
                className="text-danger!"
              >
                {t("delete")}
              </NoderaButton>
            </>
          )}
        </span>
      ),
    },
  ];

  return (
    <Table<Webhook>
      rowKey="id"
      columns={columns}
      dataSource={webhooks}
      pagination={false}
      size="middle"
      scroll={{ x: 960 }}
    />
  );
}
