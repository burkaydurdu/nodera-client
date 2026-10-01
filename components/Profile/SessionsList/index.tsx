"use client";

import { useCallback, useEffect, useState } from "react";
import { App, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useLocale, useTranslations } from "next-intl";
import { DeleteSession, GetSessions } from "@/api/users";
import type { UserSession } from "@/core/user";
import useAuth from "@/contexts/AuthContext/useAuth";
import { useNavigate } from "@/hooks/Navigation/useNavigate";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { formatDateTime } from "@/utils/date";
import Card from "@/components/Card";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";

export default function SessionsList() {
  const t = useTranslations("profile.sessions");
  const locale = useLocale();
  const { message, modal } = App.useApp();
  const { logout } = useAuth();
  const { navigate } = useNavigate();
  const { getErrorMessage } = useErrorMessage();

  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [signingOutAll, setSigningOutAll] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await GetSessions();
      setSessions(response.data ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [getErrorMessage]);

  useEffect(() => {
    load();
  }, [load]);

  const revoke = async (session: UserSession) => {
    setRevokingId(session.id);
    try {
      await DeleteSession(session.id);
      setSessions((list) => list.filter((item) => item.id !== session.id));
      message.success(t("revoked"));
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setRevokingId(null);
    }
  };

  const signOutEverywhere = () => {
    modal.confirm({
      title: t("signOutEverywhere"),
      content: t("signOutEverywhereConfirm"),
      okText: t("signOutEverywhere"),
      okButtonProps: { danger: true },
      cancelText: t("cancel"),
      centered: true,
      onOk: async () => {
        setSigningOutAll(true);
        await logout({ everywhere: true });
        navigate("/login", { replace: true });
      },
    });
  };

  const columns: ColumnsType<UserSession> = [
    {
      title: t("device"),
      dataIndex: "userAgent",
      key: "device",
      ellipsis: true,
      render: (value: string, row) => (
        <div className="flex flex-col gap-0.5">
          <span className="truncate text-sm text-text">{value || t("unknownDevice")}</span>
          {row.current && <Tag color="blue">{t("current")}</Tag>}
        </div>
      ),
    },
    { title: t("ip"), dataIndex: "ip", key: "ip", width: 140 },
    {
      title: t("lastUsed"),
      dataIndex: "lastUsedAt",
      key: "lastUsed",
      width: 180,
      render: (value: string) => formatDateTime(value, locale),
    },
    {
      title: t("createdAt"),
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (value: string) => formatDateTime(value, locale),
    },
    {
      title: "",
      key: "actions",
      width: 120,
      align: "right",
      render: (_: unknown, row) =>
        row.current ? null : (
          <NoderaButton
            variant="text"
            size="small"
            onClick={() => revoke(row)}
            loading={revokingId === row.id}
          >
            {t("revoke")}
          </NoderaButton>
        ),
    },
  ];

  return (
    <Card
      title={t("title")}
      description={t("description")}
      flush
      extra={
        <NoderaButton
          variant="danger"
          size="small"
          onClick={signOutEverywhere}
          loading={signingOutAll}
        >
          {t("signOutEverywhere")}
        </NoderaButton>
      }
    >
      {error ? (
        <div className="flex flex-col items-start gap-3 px-6 pb-6">
          <NoderaAlert variant="error" message={error} className="w-full" />
          <NoderaButton variant="outlined" size="small" onClick={load}>
            {t("retry")}
          </NoderaButton>
        </div>
      ) : (
        <Table<UserSession>
          rowKey="id"
          columns={columns}
          dataSource={sessions}
          loading={loading}
          pagination={false}
          size="middle"
          locale={{ emptyText: t("empty") }}
          scroll={{ x: 720 }}
        />
      )}
    </Card>
  );
}
