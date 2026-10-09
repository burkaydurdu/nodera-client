"use client";

import { useParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { GetStorage } from "@/api/storage";
import { ErrorCode } from "@/core/error";
import {
  STORAGE_SECTIONS,
  type Storage,
  type StorageSection,
  storagePath,
  storagesPath,
} from "@/core/storageApp";
import { StorageProvider } from "@/contexts/StorageContext/StorageContext";
import useStorageProject from "@/contexts/StorageProjectContext/useStorageProject";
import { useCan } from "@/hooks/Authz/useCan";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { useLatestRead } from "@/hooks/Loading/useLatestRead";
import { useNavigate } from "@/hooks/Navigation/useNavigate";
import { useRealtimeMessage } from "@/hooks/Realtime/useRealtimeMessage";
import { useResync } from "@/hooks/Realtime/useResync";
import { IsErrorCode } from "@/utils/error";
import Card from "@/components/Card";
import EmptyBox from "@/components/EmptyBox";
import Loading from "@/components/Loading";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import NoderaCopyButton from "@/components/NoderaCopyButton";
import PageHeader from "@/components/PageHeader";
import StorageStateAlert from "@/components/Storage/StorageStateAlert";
import StorageStateBadge from "@/components/Storage/StorageStateBadge";
import StorageTabs from "@/components/Storage/StorageTabs";
import type { StorageTabKey } from "@/components/Storage/StorageTabs/type";

const isSection = (value: string | undefined): value is StorageSection =>
  !!value && (STORAGE_SECTIONS as readonly string[]).includes(value);

/**
 * The shell of one Storage: it reads the Storage once for Files, Access keys, Usage and
 * Settings, draws its name, state, banners and tabs over them, and refetches on
 * `storage.changed`. The pages take the Storage from the context.
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  const { storageId } = useParams<{ storageId: string }>();
  const pathname = usePathname();
  const { project } = useStorageProject();
  const t = useTranslations("storage.detail");
  const tl = useTranslations("storage.list");
  const { navigate } = useNavigate();
  const { getErrorMessage } = useErrorMessage();
  const canWrite = useCan("storage.write");

  const storageRead = useLatestRead<Storage | null>(
    async () => (await GetStorage(project.id, storageId)).data,
    `${project.id}:${storageId}`,
    null
  );
  const storage = storageRead.data;

  useRealtimeMessage("storage.changed", (change) => {
    if (change.storageId === storageId) storageRead.refresh();
  });
  useResync(storageRead.refresh);

  const listPath = storagesPath(project.id);
  const section = pathname.slice(storagePath(project.id, storageId).length + 1).split("/")[0];
  const activeTab: StorageTabKey = isSection(section) ? section : "files";

  const openTab = (key: StorageTabKey) =>
    navigate(
      key === "files"
        ? storagePath(project.id, storageId)
        : storagePath(project.id, storageId, key)
    );

  const breadcrumb = [
    { label: tl("title"), href: listPath },
    { label: storage?.bucketName ?? t("title") },
  ];

  if (storageRead.isLoading) {
    return (
      <>
        <PageHeader title={t("title")} breadcrumb={breadcrumb} />
        <Loading />
      </>
    );
  }

  if (IsErrorCode(storageRead.error, ErrorCode.StorageNotFound)) {
    return (
      <>
        <PageHeader title={t("title")} breadcrumb={breadcrumb} />
        <Card className="mx-auto w-full max-w-xl">
          <EmptyBox
            title={t("notFoundTitle")}
            description={t("notFoundDescription")}
            actionLabel={t("backToList")}
            onAction={() => navigate(listPath)}
          />
        </Card>
      </>
    );
  }

  if (storageRead.error || !storage) {
    return (
      <>
        <PageHeader title={t("title")} breadcrumb={breadcrumb} />
        <div className="flex flex-col items-start gap-3">
          <NoderaAlert
            variant="error"
            message={
              storageRead.error ? getErrorMessage(storageRead.error) : t("notFoundTitle")
            }
            className="w-full"
          />
          <NoderaButton variant="outlined" onClick={storageRead.reload}>
            {t("retry")}
          </NoderaButton>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={storage.bucketName}
        description={t("description", {
          region: storage.region,
          package: storage.package.code,
        })}
        breadcrumb={breadcrumb}
        extra={<StorageStateBadge state={storage.state} />}
      />
      <div className="-mt-2 mb-4 flex min-w-0 items-center gap-1 text-sm">
        <span className="shrink-0 text-text-muted">{t("url")}</span>
        <span className="truncate font-mono text-text" title={storage.url}>
          {storage.url}
        </span>
        <NoderaCopyButton value={storage.url} label={t("copyUrl")} />
      </div>
      <StorageStateAlert storage={storage} canWrite={canWrite} />
      <StorageTabs active={activeTab} onChange={openTab} />
      <StorageProvider
        storage={storage}
        refresh={storageRead.refresh}
        setStorage={storageRead.setData}
      >
        {children}
      </StorageProvider>
    </>
  );
}
