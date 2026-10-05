"use client";

import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useLocale, useTranslations } from "next-intl";
import type { ApiKey } from "@/core/apiKey";
import { isKeyPermission } from "@/core/authz";
import { formatDateTime } from "@/utils/date";
import NoderaButton from "@/components/NoderaButton";
import NoderaCopyButton from "@/components/NoderaCopyButton";
import type { ApiKeyTableProps } from "./type";

export default function ApiKeyTable({
  keys,
  members,
  currentUserId,
  revokingId = null,
  onRevoke,
}: ApiKeyTableProps) {
  const t = useTranslations("apiKeys");
  const locale = useLocale();

  // A key outlives its creator's membership: one who left is named neutrally, never guessed.
  const renderCreator = (key: ApiKey) => {
    if (!members) return <span className="text-sm text-text-muted">—</span>;
    const creator = members.find((member) => member.userId === key.createdBy);
    if (!creator) return <span className="text-sm text-text-muted">{t("formerMember")}</span>;
    return (
      <span className="flex min-w-0 items-center gap-2">
        <span className="truncate text-sm text-text">{creator.fullName}</span>
        {creator.userId === currentUserId && (
          <span className="shrink-0 text-xs text-text-muted">{t("you")}</span>
        )}
      </span>
    );
  };

  const columns: ColumnsType<ApiKey> = [
    {
      title: t("columns.name"),
      dataIndex: "name",
      key: "name",
      ellipsis: true,
      render: (name: string) => <span className="text-sm font-medium text-text">{name}</span>,
    },
    {
      title: t("columns.key"),
      dataIndex: "prefix",
      key: "prefix",
      width: 230,
      render: (prefix: string) => (
        <span className="flex items-center gap-1">
          <span className="truncate font-mono text-xs text-text-muted">{`${prefix}.••••`}</span>
          <NoderaCopyButton value={prefix} label={t("copyPrefix")} />
        </span>
      ),
    },
    {
      title: t("columns.permissions"),
      dataIndex: "permissions",
      key: "permissions",
      width: 160,
      render: (permissions: string[]) => (
        <span className="flex flex-wrap gap-1">
          {(permissions ?? []).map((permission) => (
            <Tag key={permission} className="m-0 rounded-badge">
              {isKeyPermission(permission) ? t(`permissions.${permission}.label`) : permission}
            </Tag>
          ))}
        </span>
      ),
    },
    {
      title: t("columns.createdBy"),
      key: "createdBy",
      width: 170,
      ellipsis: true,
      render: (_: unknown, key) => renderCreator(key),
    },
    {
      title: t("columns.created"),
      dataIndex: "createdAt",
      key: "created",
      width: 170,
      render: (value: string) => formatDateTime(value, locale),
    },
    {
      title: t("columns.lastUsed"),
      dataIndex: "lastUsedAt",
      key: "lastUsed",
      width: 170,
      render: (value: string | null) =>
        value ? (
          formatDateTime(value, locale)
        ) : (
          <span className="text-text-muted">{t("neverUsed")}</span>
        ),
    },
    {
      title: "",
      key: "actions",
      width: 100,
      align: "right",
      render: (_: unknown, key) => (
        <NoderaButton
          variant="text"
          size="small"
          onClick={() => onRevoke(key)}
          loading={revokingId === key.id}
          className="text-danger!"
        >
          {t("revoke")}
        </NoderaButton>
      ),
    },
  ];

  return (
    <Table<ApiKey>
      rowKey="id"
      columns={columns}
      dataSource={keys}
      pagination={false}
      size="middle"
      locale={{ emptyText: t("empty") }}
      scroll={{ x: 1000 }}
    />
  );
}
