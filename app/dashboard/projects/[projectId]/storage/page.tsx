"use client";

import { DatabaseOutlined, PlusOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import { ListStorages } from "@/api/storage";
import { ErrorCode } from "@/core/error";
import { PROJECT_ACCESS_RETRY_INTERVAL_MS, PROJECT_ACCESS_RETRY_MS } from "@/core/project";
import {
  MAX_STORAGES_PER_PROJECT,
  type Storage,
  newStoragePath,
  storagePath,
} from "@/core/storageApp";
import useStorageProject from "@/contexts/StorageProjectContext/useStorageProject";
import { useCan } from "@/hooks/Authz/useCan";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { useLatestRead } from "@/hooks/Loading/useLatestRead";
import { useNavigate } from "@/hooks/Navigation/useNavigate";
import { useRealtimeMessage } from "@/hooks/Realtime/useRealtimeMessage";
import { useResync } from "@/hooks/Realtime/useResync";
import { IsErrorCode } from "@/utils/error";
import { retryUntil } from "@/utils/retry";
import Card from "@/components/Card";
import EmptyBox from "@/components/EmptyBox";
import Loading from "@/components/Loading";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import PageHeader from "@/components/PageHeader";
import StorageTable from "@/components/Storage/StorageTable";

export default function Page() {
  const { project } = useStorageProject();
  const t = useTranslations("storage.list");
  const { navigate } = useNavigate();
  const { getErrorMessage } = useErrorMessage();
  const canWrite = useCan("storage.write");

  const storagesRead = useLatestRead<Storage[]>(
    async (first, signal) =>
      // Storage learns a Project from an event (ADR-0004): right after the Project was created
      // its list answers "not found" for a moment, so the first read is retried briefly.
      (
        await retryUntil(() => ListStorages(project.id), {
          shouldRetry: (err) => first && IsErrorCode(err, ErrorCode.StorageProjectNotFound),
          timeoutMs: PROJECT_ACCESS_RETRY_MS,
          intervalMs: PROJECT_ACCESS_RETRY_INTERVAL_MS,
          signal,
        })
      ).data ?? [],
    project.id,
    []
  );
  const storages = storagesRead.data;

  useRealtimeMessage("storage.changed", (change) => {
    if (change.projectId === project.id) storagesRead.refresh();
  });
  useResync(storagesRead.refresh);

  const atLimit = storages.length >= MAX_STORAGES_PER_PROJECT;
  const openNew = () => navigate(newStoragePath(project.id));

  const header = (
    <PageHeader
      title={t("title")}
      description={t("description", { project: project.name })}
      extra={
        canWrite && storages.length > 0 ? (
          <NoderaButton
            variant="filled"
            icon={<PlusOutlined />}
            onClick={openNew}
            disabled={atLimit}
          >
            {t("open")}
          </NoderaButton>
        ) : undefined
      }
    />
  );

  if (storagesRead.isLoading) {
    return (
      <>
        {header}
        <Loading />
      </>
    );
  }

  if (storagesRead.error) {
    return (
      <>
        {header}
        <div className="flex flex-col items-start gap-3">
          {IsErrorCode(storagesRead.error, ErrorCode.StorageProjectNotFound) ? (
            <NoderaAlert
              variant="info"
              message={t("accessPendingTitle")}
              description={t("accessPending")}
              className="w-full"
            />
          ) : (
            <NoderaAlert
              variant="error"
              message={getErrorMessage(storagesRead.error)}
              className="w-full"
            />
          )}
          <NoderaButton variant="outlined" onClick={storagesRead.reload}>
            {t("retry")}
          </NoderaButton>
        </div>
      </>
    );
  }

  return (
    <>
      {header}
      {atLimit && canWrite && (
        <NoderaAlert
          variant="info"
          message={t("limitReached", { max: MAX_STORAGES_PER_PROJECT })}
        />
      )}
      {storages.length === 0 ? (
        <Card className="mx-auto w-full max-w-xl">
          <EmptyBox
            icon={<DatabaseOutlined style={{ fontSize: 26 }} />}
            title={t("emptyTitle")}
            description={canWrite ? t("emptyDescription") : t("emptyReadOnly")}
            actionLabel={canWrite ? t("open") : undefined}
            onAction={canWrite ? openNew : undefined}
          />
        </Card>
      ) : (
        <Card flush>
          <StorageTable
            storages={storages}
            onOpen={(storage) => navigate(storagePath(project.id, storage.id))}
          />
        </Card>
      )}
    </>
  );
}
