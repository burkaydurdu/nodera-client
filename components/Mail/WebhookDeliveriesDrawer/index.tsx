"use client";

import { Drawer, Table, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useLocale, useTranslations } from "next-intl";
import { ListWebhookDeliveries } from "@/api/mail";
import type { WebhookDelivery, WebhookDeliveryStatus } from "@/core/mail";
import { useCursorList } from "@/hooks/Paging/useCursorList";
import { formatDateTime } from "@/utils/date";
import WebhookDeliveryStatusBadge from "@/components/Mail/WebhookDeliveryStatusBadge";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import type { WebhookDeliveriesDrawerProps } from "./type";

/**
 * A Webhook's deliveries of the last 30 days: each batch of Message events, its attempts and
 * the last answer, so a failing endpoint is noticed before its retries run out.
 */
export default function WebhookDeliveriesDrawer({
  projectId,
  webhook,
  onClose,
}: WebhookDeliveriesDrawerProps) {
  const t = useTranslations("mail.webhooks.deliveries");
  const locale = useLocale();
  const webhookId = webhook?.id ?? null;

  const list = useCursorList(
    async (cursor) =>
      (await ListWebhookDeliveries(projectId, webhookId ?? "", cursor ? { cursor } : {})).data,
    `${projectId}:${webhookId ?? ""}`,
    !!webhookId
  );

  const columns: ColumnsType<WebhookDelivery> = [
    {
      title: t("columns.created"),
      dataIndex: "createdAt",
      key: "created",
      width: 160,
      render: (value: string) => (
        <span className="text-sm text-text">{formatDateTime(value, locale)}</span>
      ),
    },
    {
      title: t("columns.status"),
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status: WebhookDeliveryStatus) => (
        <WebhookDeliveryStatusBadge status={status} />
      ),
    },
    {
      title: t("columns.events"),
      dataIndex: "eventCount",
      key: "events",
      width: 80,
      align: "right",
    },
    {
      title: t("columns.attempts"),
      dataIndex: "attempts",
      key: "attempts",
      width: 90,
      align: "right",
    },
    {
      title: t("columns.lastAttempt"),
      key: "lastAttempt",
      render: (_: unknown, delivery) => (
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-sm text-text">
            {delivery.lastAttemptAt ? formatDateTime(delivery.lastAttemptAt, locale) : "—"}
            {delivery.lastStatusCode != null && (
              <span className="ml-2 font-mono text-xs text-text-muted">
                {t("statusCode", { code: delivery.lastStatusCode })}
              </span>
            )}
          </span>
          {delivery.lastError && (
            <Tooltip title={delivery.lastError}>
              <span className="truncate font-mono text-xs text-danger">
                {delivery.lastError}
              </span>
            </Tooltip>
          )}
          {delivery.status === "pending" && delivery.nextAttemptAt && (
            <span className="text-xs text-text-muted">
              {t("nextAttempt", { date: formatDateTime(delivery.nextAttemptAt, locale) })}
            </span>
          )}
        </span>
      ),
    },
  ];

  return (
    <Drawer open={!!webhook} onClose={onClose} title={t("title")} width={820} destroyOnHidden>
      <div className="flex flex-col gap-section">
        {webhook && (
          <p className="break-all font-mono text-sm text-text-muted">{webhook.url}</p>
        )}
        {list.error ? (
          <div className="flex flex-col items-start gap-3">
            <NoderaAlert variant="error" message={list.error} className="w-full" />
            <NoderaButton variant="outlined" size="small" onClick={() => void list.reload()}>
              {t("retry")}
            </NoderaButton>
          </div>
        ) : (
          <Table<WebhookDelivery>
            rowKey="id"
            columns={columns}
            dataSource={list.items}
            loading={list.isLoading}
            pagination={false}
            size="small"
            locale={{ emptyText: t("empty") }}
            scroll={{ x: 720 }}
          />
        )}
        {list.hasMore && (
          <div className="flex justify-center">
            <NoderaButton
              variant="outlined"
              loading={list.isLoadingMore}
              onClick={() => void list.loadMore()}
            >
              {t("loadMore")}
            </NoderaButton>
          </div>
        )}
        <p className="text-xs leading-4 text-text-muted">{t("rules")}</p>
      </div>
    </Drawer>
  );
}
