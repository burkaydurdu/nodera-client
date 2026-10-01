"use client";

import { Select, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useLocale, useTranslations } from "next-intl";
import { ROLES } from "@/core/authz";
import type { Member } from "@/core/member";
import type { TeamRole } from "@/core/user";
import { formatDateTime } from "@/utils/date";
import NoderaButton from "@/components/NoderaButton";
import RoleBadge from "@/components/Teams/RoleBadge";
import type { MemberTableProps } from "./type";

export default function MemberTable({
  members,
  currentUserId,
  canManage,
  loading = false,
  busyUserId = null,
  onRoleChange,
  onRemove,
  onLeave,
}: MemberTableProps) {
  const t = useTranslations("members");
  const tr = useTranslations("teams.roles");
  const locale = useLocale();

  const roleOptions = ROLES.map((role) => ({ value: role, label: tr(role) }));

  const columns: ColumnsType<Member> = [
    {
      title: t("columns.name"),
      dataIndex: "fullName",
      key: "name",
      ellipsis: true,
      render: (name: string, row) => (
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-text">{name}</span>
          {row.userId === currentUserId && (
            <span className="text-xs text-text-muted">{t("you")}</span>
          )}
        </span>
      ),
    },
    {
      title: t("columns.email"),
      dataIndex: "email",
      key: "email",
      ellipsis: true,
      render: (email: string) => <span className="text-sm text-text-muted">{email}</span>,
    },
    {
      title: t("columns.role"),
      dataIndex: "role",
      key: "role",
      width: 170,
      render: (role: TeamRole, row) =>
        // One's own Role is never editable (5-10006): another owner must change it.
        canManage && row.userId !== currentUserId ? (
          <Select<TeamRole>
            size="small"
            value={role}
            options={roleOptions}
            onChange={(next) => onRoleChange(row, next)}
            disabled={busyUserId === row.userId}
            aria-label={t("roleOf", { name: row.fullName })}
            className="w-full"
          />
        ) : (
          <RoleBadge role={role} />
        ),
    },
    {
      title: t("columns.joined"),
      dataIndex: "joinedAt",
      key: "joined",
      width: 180,
      render: (value: string) => formatDateTime(value, locale),
    },
    {
      title: "",
      key: "actions",
      width: 120,
      align: "right",
      render: (_: unknown, row) => {
        if (row.userId === currentUserId) {
          return (
            <NoderaButton
              variant="text"
              size="small"
              onClick={() => onLeave(row)}
              loading={busyUserId === row.userId}
              className="text-danger!"
            >
              {t("leave")}
            </NoderaButton>
          );
        }
        if (!canManage) return null;
        return (
          <NoderaButton
            variant="text"
            size="small"
            onClick={() => onRemove(row)}
            loading={busyUserId === row.userId}
            className="text-danger!"
          >
            {t("remove")}
          </NoderaButton>
        );
      },
    },
  ];

  return (
    <Table<Member>
      rowKey="userId"
      columns={columns}
      dataSource={members}
      loading={loading}
      pagination={false}
      size="middle"
      locale={{ emptyText: t("empty") }}
      scroll={{ x: 760 }}
    />
  );
}
