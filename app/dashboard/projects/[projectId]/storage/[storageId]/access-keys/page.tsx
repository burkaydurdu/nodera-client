"use client";

import { useState } from "react";
import { App } from "antd";
import { KeyOutlined, PlusOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import { ListAccessKeys, RevokeAccessKey } from "@/api/storage";
import { withoutSecret } from "@/core/secret";
import {
  type AccessKey,
  type CreatedAccessKey,
  MAX_ACCESS_KEYS_PER_STORAGE,
  isDeleting,
} from "@/core/storageApp";
import useAuth from "@/contexts/AuthContext/useAuth";
import useStorage from "@/contexts/StorageContext/useStorage";
import useStorageProject from "@/contexts/StorageProjectContext/useStorageProject";
import { useCan } from "@/hooks/Authz/useCan";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { useLatestRead } from "@/hooks/Loading/useLatestRead";
import { useResync } from "@/hooks/Realtime/useResync";
import Card from "@/components/Card";
import EmptyBox from "@/components/EmptyBox";
import Loading from "@/components/Loading";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import AccessKeyCreatedModal from "@/components/Storage/AccessKeyCreatedModal";
import AccessKeyTable from "@/components/Storage/AccessKeyTable";
import CreateAccessKeyModal from "@/components/Storage/CreateAccessKeyModal";

export default function Page() {
  const { project } = useStorageProject();
  const { storage } = useStorage();
  const t = useTranslations("storage.accessKeys");
  const { message, modal } = App.useApp();
  const { getErrorMessage } = useErrorMessage();
  const { currentUser } = useAuth();
  // A Storage on its way out has revoked its keys already; nothing is made or revoked on it.
  const canWrite = useCan("storage.write") && !isDeleting(storage);

  const [formOpen, setFormOpen] = useState(false);
  const [created, setCreated] = useState<CreatedAccessKey | null>(null);
  const [secretOpen, setSecretOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const keysRead = useLatestRead<AccessKey[]>(
    async () => (await ListAccessKeys(project.id, storage.id)).data ?? [],
    `${project.id}:${storage.id}`,
    []
  );
  const accessKeys = keysRead.data;

  useResync(keysRead.refresh);

  const handleCreated = (accessKey: CreatedAccessKey) => {
    setFormOpen(false);
    keysRead.setData((list) => [
      ...list.filter((item) => item.id !== accessKey.id),
      withoutSecret(accessKey, "secretKey"),
    ]);
    setCreated(accessKey);
    setSecretOpen(true);
  };

  const confirmRevoke = (accessKey: AccessKey) => {
    modal.confirm({
      title: t("revokeTitle", { name: accessKey.name }),
      content: t("revokeConfirm"),
      okText: t("revoke"),
      okButtonProps: { danger: true },
      cancelText: t("cancel"),
      centered: true,
      onOk: async () => {
        setBusyId(accessKey.id);
        try {
          await RevokeAccessKey(project.id, storage.id, accessKey.id);
          keysRead.setData((list) => list.filter((item) => item.id !== accessKey.id));
          message.success(t("revoked", { name: accessKey.name }));
        } catch (err) {
          message.error(getErrorMessage(err));
          // The key may be gone already (revoked elsewhere): the list is read again.
          keysRead.refresh();
        } finally {
          setBusyId(null);
        }
      },
    });
  };

  const atLimit = accessKeys.length >= MAX_ACCESS_KEYS_PER_STORAGE;

  if (keysRead.isLoading) return <Loading />;

  if (keysRead.error) {
    return (
      <div className="flex flex-col items-start gap-3">
        <NoderaAlert
          variant="error"
          message={getErrorMessage(keysRead.error)}
          className="w-full"
        />
        <NoderaButton variant="outlined" onClick={keysRead.reload}>
          {t("retry")}
        </NoderaButton>
      </div>
    );
  }

  return (
    <>
      {atLimit && canWrite && (
        <NoderaAlert
          variant="info"
          message={t("limitReached", { max: MAX_ACCESS_KEYS_PER_STORAGE })}
        />
      )}
      {accessKeys.length === 0 ? (
        <Card className="mx-auto w-full max-w-xl">
          <EmptyBox
            icon={<KeyOutlined style={{ fontSize: 26 }} />}
            title={t("emptyTitle")}
            description={canWrite ? t("emptyDescription") : t("emptyReadOnly")}
            actionLabel={canWrite ? t("create") : undefined}
            onAction={canWrite ? () => setFormOpen(true) : undefined}
          />
        </Card>
      ) : (
        <Card
          title={t("title")}
          description={t("description")}
          flush
          extra={
            canWrite ? (
              <NoderaButton
                variant="filled"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => setFormOpen(true)}
                disabled={atLimit}
              >
                {t("create")}
              </NoderaButton>
            ) : undefined
          }
        >
          <AccessKeyTable
            accessKeys={accessKeys}
            currentUserId={currentUser?.id ?? null}
            canRevoke={canWrite}
            busyId={busyId}
            onRevoke={confirmRevoke}
          />
        </Card>
      )}
      <CreateAccessKeyModal
        open={formOpen}
        projectId={project.id}
        storageId={storage.id}
        onClose={() => setFormOpen(false)}
        onCreated={handleCreated}
      />
      <AccessKeyCreatedModal
        open={secretOpen}
        accessKey={created}
        storage={storage}
        onClose={() => setSecretOpen(false)}
        afterClose={() => setCreated(null)}
      />
    </>
  );
}
