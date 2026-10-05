"use client";

import { Table, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { LockOutlined } from "@ant-design/icons";
import classNames from "classnames";
import { useLocale, useTranslations } from "next-intl";
import {
  type Suppression,
  type SuppressionReason,
  isSuppressionRemovable,
  messagePath,
} from "@/core/mail";
import { formatDateTime } from "@/utils/date";
import NoderaButton from "@/components/NoderaButton";
import NoderaLink from "@/components/NoderaLink";
import type { SuppressionTableProps } from "./type";

/** Static class map so Tailwind sees every utility (theme/tokens.ts `status`). */
const reasonClasses: Record<SuppressionReason, string> = {
  bounce: "bg-status-deleting-soft text-status-deleting",
  complaint: "bg-status-failed-soft text-status-failed",
};

export default function SuppressionTable({
  projectId,
  suppressions,
  loading = false,
  deletingId = null,
  onDelete,
}: SuppressionTableProps) {
  const t = useTranslations("mail.suppressions");
  const locale = useLocale();

  const columns: ColumnsType<Suppression> = [
    {
      title: t("columns.address"),
      dataIndex: "address",
      key: "address",
      ellipsis: true,
      render: (address: string) => (
        <span className="font-mono text-sm font-medium text-text">{address}</span>
      ),
    },
    {
      title: t("columns.reason"),
      dataIndex: "reason",
      key: "reason",
      width: 150,
      render: (reason: SuppressionReason) => (
        <span
          className={classNames(
            "inline-flex h-6 items-center rounded-badge px-2.5 text-xs font-semibold",
            reasonClasses[reason] ?? reasonClasses.bounce
          )}
        >
          {t(`reasons.${reason === "complaint" ? "complaint" : "bounce"}`)}
        </span>
      ),
    },
    {
      title: t("columns.message"),
      dataIndex: "messageId",
      key: "message",
      width: 150,
      render: (messageId: string | null) =>
        messageId ? (
          <NoderaLink href={messagePath(projectId, messageId)} className="text-sm">
            {t("viewMessage")}
          </NoderaLink>
        ) : (
          <span className="text-text-muted">—</span>
        ),
    },
    {
      title: t("columns.added"),
      dataIndex: "createdAt",
      key: "added",
      width: 190,
      render: (value: string) => formatDateTime(value, locale),
    },
    ...(onDelete
      ? [
          {
            title: "",
            key: "actions",
            width: 200,
            align: "right" as const,
            render: (_: unknown, suppression: Suppression) =>
              isSuppressionRemovable(suppression) ? (
                <NoderaButton
                  variant="text"
                  size="small"
                  onClick={() => onDelete(suppression)}
                  loading={deletingId === suppression.id}
                  className="text-danger!"
                >
                  {t("remove")}
                </NoderaButton>
              ) : (
                <Tooltip title={t("complaintLocked")}>
                  <span className="inline-flex cursor-help items-center gap-1.5 text-xs text-text-muted">
                    <LockOutlined />
                    {t("complaintLockedShort")}
                  </span>
                </Tooltip>
              ),
          },
        ]
      : []),
  ];

  return (
    <Table<Suppression>
      rowKey="id"
      columns={columns}
      dataSource={suppressions}
      loading={loading}
      pagination={false}
      size="middle"
      locale={{ emptyText: t("empty") }}
      scroll={{ x: 860 }}
    />
  );
}
