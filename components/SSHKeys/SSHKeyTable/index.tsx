"use client";

import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useLocale, useTranslations } from "next-intl";
import type { SSHKey } from "@/core/sshKey";
import { formatDateTime } from "@/utils/date";
import NoderaButton from "@/components/NoderaButton";
import NoderaCopyButton from "@/components/NoderaCopyButton";
import type { SSHKeyTableProps } from "./type";

export default function SSHKeyTable({
  keys,
  loading = false,
  deletingId = null,
  onDelete,
}: SSHKeyTableProps) {
  const t = useTranslations("sshKeys");
  const locale = useLocale();

  const columns: ColumnsType<SSHKey> = [
    {
      title: t("columns.name"),
      dataIndex: "name",
      key: "name",
      ellipsis: true,
      render: (name: string) => <span className="text-sm font-medium text-text">{name}</span>,
    },
    {
      title: t("columns.fingerprint"),
      dataIndex: "fingerprint",
      key: "fingerprint",
      ellipsis: true,
      render: (fingerprint: string) => (
        <span className="flex items-center gap-1">
          <span className="truncate font-mono text-xs text-text-muted">{fingerprint}</span>
          <NoderaCopyButton value={fingerprint} />
        </span>
      ),
    },
    {
      title: t("columns.created"),
      dataIndex: "createdAt",
      key: "created",
      width: 180,
      render: (value: string) => formatDateTime(value, locale),
    },
    ...(onDelete
      ? [
          {
            title: "",
            key: "actions",
            width: 110,
            align: "right" as const,
            render: (_: unknown, key: SSHKey) => (
              <NoderaButton
                variant="text"
                size="small"
                onClick={() => onDelete(key)}
                loading={deletingId === key.id}
                className="text-danger!"
              >
                {t("delete")}
              </NoderaButton>
            ),
          },
        ]
      : []),
  ];

  return (
    <Table<SSHKey>
      rowKey="id"
      columns={columns}
      dataSource={keys}
      loading={loading}
      pagination={false}
      size="middle"
      locale={{ emptyText: t("empty") }}
      scroll={{ x: 720 }}
    />
  );
}
