"use client";

import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useLocale, useTranslations } from "next-intl";
import {
  type Invitation,
  type InvitationInviter,
  type InvitationStatus,
  isInvitationPending,
} from "@/core/invitation";
import type { TeamRole } from "@/core/user";
import { formatDateTime } from "@/utils/date";
import InvitationStatusBadge from "@/components/Invitations/InvitationStatusBadge";
import ResendInvitationButton from "@/components/Invitations/ResendInvitationButton";
import NoderaButton from "@/components/NoderaButton";
import RoleBadge from "@/components/Teams/RoleBadge";
import type { InvitationTableProps } from "./type";

export default function InvitationTable({
  invitations,
  loading = false,
  revokingId = null,
  onResend,
  onRevoke,
}: InvitationTableProps) {
  const t = useTranslations("invitations");
  const locale = useLocale();

  const columns: ColumnsType<Invitation> = [
    {
      title: t("columns.email"),
      dataIndex: "email",
      key: "email",
      ellipsis: true,
      render: (email: string) => (
        <span className="text-sm font-medium text-text">{email}</span>
      ),
    },
    {
      title: t("columns.role"),
      dataIndex: "role",
      key: "role",
      width: 130,
      render: (role: TeamRole) => <RoleBadge role={role} />,
    },
    {
      title: t("columns.status"),
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status: InvitationStatus) => <InvitationStatusBadge status={status} />,
    },
    {
      title: t("columns.invitedBy"),
      dataIndex: "invitedBy",
      key: "invitedBy",
      ellipsis: true,
      render: (inviter: InvitationInviter) => (
        <span className="text-sm text-text-muted">{inviter?.fullName}</span>
      ),
    },
    {
      title: t("columns.expires"),
      dataIndex: "expiresAt",
      key: "expires",
      width: 180,
      render: (value: string) => formatDateTime(value, locale),
    },
    {
      title: "",
      key: "actions",
      width: 200,
      align: "right",
      render: (_: unknown, row) =>
        isInvitationPending(row.status) ? (
          <span className="flex items-center justify-end gap-1">
            <ResendInvitationButton
              invitation={row}
              onResend={onResend}
              disabled={revokingId === row.id}
            />
            <NoderaButton
              variant="text"
              size="small"
              onClick={() => onRevoke(row)}
              loading={revokingId === row.id}
              className="text-danger!"
            >
              {t("revoke")}
            </NoderaButton>
          </span>
        ) : null,
    },
  ];

  return (
    <Table<Invitation>
      rowKey="id"
      columns={columns}
      dataSource={invitations}
      loading={loading}
      pagination={false}
      size="middle"
      locale={{ emptyText: t("empty") }}
      scroll={{ x: 920 }}
    />
  );
}
