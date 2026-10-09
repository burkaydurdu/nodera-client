"use client";

import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DeleteOutlined } from "@ant-design/icons";
import { useLocale, useTranslations } from "next-intl";
import type { AccessKey, AccessKeyPermission } from "@/core/storageApp";
import { formatDateTime } from "@/utils/date";
import NoderaButton from "@/components/NoderaButton";
import NoderaCopyButton from "@/components/NoderaCopyButton";
import type { AccessKeyTableProps } from "./type";

export default function AccessKeyTable({
  accessKeys,
  currentUserId,
  canRevoke,
  busyId,
  onRevoke,
}: AccessKeyTableProps) {
  const t = useTranslations("storage.accessKeys");
  const locale = useLocale();

  const columns: ColumnsType<AccessKey> = [
    {
      title: t("columns.name"),
      dataIndex: "name",
      key: "name",
      ellipsis: true,
      render: (name: string) => <span className="text-sm font-medium text-text">{name}</span>,
    },
    {
      title: t("columns.accessKeyId"),
      dataIndex: "accessKeyId",
      key: "accessKeyId",
      width: 260,
      render: (id: string) => (
        <span className="flex items-center gap-1">
          <span className="truncate font-mono text-sm text-text">{id}</span>
          <NoderaCopyButton value={id} />
        </span>
      ),
    },
    {
      title: t("columns.permission"),
      dataIndex: "permission",
      key: "permission",
      width: 140,
      render: (permission: AccessKeyPermission) => (
        <Tag color={permission === "read_write" ? "blue" : undefined}>
          {t(`permissions.${permission}`)}
        </Tag>
      ),
    },
    {
      title: t("columns.createdBy"),
      dataIndex: "createdBy",
      key: "createdBy",
      width: 160,
      ellipsis: true,
      render: (createdBy: string) =>
        createdBy === currentUserId ? (
          t("you")
        ) : (
          <span className="font-mono text-xs text-text-muted">{createdBy}</span>
        ),
    },
    {
      title: t("columns.createdAt"),
      dataIndex: "createdAt",
      key: "createdAt",
      width: 190,
      render: (value: string) => formatDateTime(value, locale),
    },
    ...(canRevoke
      ? [
          {
            key: "actions",
            width: 120,
            align: "right" as const,
            render: (_value: unknown, accessKey: AccessKey) => (
              <NoderaButton
                variant="text"
                size="small"
                icon={<DeleteOutlined />}
                loading={busyId === accessKey.id}
                disabled={busyId !== null && busyId !== accessKey.id}
                onClick={() => onRevoke(accessKey)}
                className="text-danger!"
              >
                {t("revoke")}
              </NoderaButton>
            ),
          },
        ]
      : []),
  ];

  return (
    <Table<AccessKey>
      rowKey="id"
      columns={columns}
      dataSource={accessKeys}
      pagination={false}
      size="middle"
      scroll={{ x: 960 }}
    />
  );
}
