"use client";

import { useCallback, useEffect, useState } from "react";
import { App } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import { DeleteSSHKey, ListSSHKeys } from "@/api/sshKeys";
import type { SSHKey } from "@/core/sshKey";
import useTeam from "@/contexts/TeamContext/useTeam";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import Card from "@/components/Card";
import EmptyBox from "@/components/EmptyBox";
import Loading from "@/components/Loading";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import PageHeader from "@/components/PageHeader";
import AddSSHKeyModal from "@/components/SSHKeys/AddSSHKeyModal";
import SSHKeyTable from "@/components/SSHKeys/SSHKeyTable";

export default function Page() {
  const t = useTranslations("sshKeys");
  const { message, modal } = App.useApp();
  const { getErrorMessage } = useErrorMessage();
  const { currentTeam, isLoading: teamsLoading, error: teamsError, reload } = useTeam();

  const [keys, setKeys] = useState<SSHKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const teamId = currentTeam?.id ?? null;

  const load = useCallback(async () => {
    if (!teamId) {
      setKeys([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await ListSSHKeys(teamId);
      setKeys(response.data ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [teamId, getErrorMessage]);

  useEffect(() => {
    if (teamsLoading) return;
    setModalOpen(false);
    load();
  }, [load, teamsLoading]);

  const handleCreated = (key: SSHKey) => {
    setKeys((list) => [key, ...list]);
    setModalOpen(false);
    message.success(t("form.created", { name: key.name }));
  };

  const confirmDelete = (key: SSHKey) => {
    if (!teamId) return;
    modal.confirm({
      title: t("deleteTitle", { name: key.name }),
      content: t("deleteConfirm"),
      okText: t("delete"),
      okButtonProps: { danger: true },
      cancelText: t("cancel"),
      centered: true,
      onOk: async () => {
        setDeletingId(key.id);
        try {
          await DeleteSSHKey(teamId, key.id);
          setKeys((list) => list.filter((item) => item.id !== key.id));
          message.success(t("deleted", { name: key.name }));
        } catch (err) {
          message.error(getErrorMessage(err));
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  const header = (
    <PageHeader
      title={t("title")}
      description={currentTeam ? t("description", { team: currentTeam.name }) : undefined}
      extra={
        currentTeam && keys.length > 0 ? (
          <NoderaButton
            variant="filled"
            icon={<PlusOutlined />}
            onClick={() => setModalOpen(true)}
          >
            {t("add")}
          </NoderaButton>
        ) : undefined
      }
    />
  );

  if (teamsLoading || (loading && currentTeam)) {
    return (
      <>
        {header}
        <Loading />
      </>
    );
  }

  if (teamsError || !currentTeam) {
    return (
      <>
        {header}
        <div className="flex flex-col items-start gap-3">
          <NoderaAlert
            variant="error"
            message={teamsError ?? t("noTeam")}
            className="w-full"
          />
          <NoderaButton variant="outlined" onClick={reload}>
            {t("retry")}
          </NoderaButton>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        {header}
        <div className="flex flex-col items-start gap-3">
          <NoderaAlert variant="error" message={error} className="w-full" />
          <NoderaButton variant="outlined" onClick={load}>
            {t("retry")}
          </NoderaButton>
        </div>
      </>
    );
  }

  return (
    <>
      {header}
      {keys.length === 0 ? (
        <Card className="mx-auto w-full max-w-xl">
          <EmptyBox
            title={t("emptyTitle")}
            description={t("emptyDescription")}
            actionLabel={t("add")}
            onAction={() => setModalOpen(true)}
          />
        </Card>
      ) : (
        <Card flush>
          <SSHKeyTable keys={keys} deletingId={deletingId} onDelete={confirmDelete} />
        </Card>
      )}
      <AddSSHKeyModal
        open={modalOpen}
        teamId={currentTeam.id}
        onClose={() => setModalOpen(false)}
        onCreated={handleCreated}
      />
    </>
  );
}
