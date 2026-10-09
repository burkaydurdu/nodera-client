"use client";

import { Suspense, useCallback, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { App } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import {
  DeleteObjects,
  GetDownloadUrl,
  GetObjectAccess,
  RestoreBrowserAccess,
  SetObjectAccess,
} from "@/api/storage";
import {
  MAX_OBJECTS_PER_DELETE,
  OBJECT_PREFIX_PARAM,
  type StorageObject,
  canReadObjects,
  canWriteObjects,
  parentPrefix,
  storagePath,
} from "@/core/storageApp";
import useStorage from "@/contexts/StorageContext/useStorage";
import useStorageProject from "@/contexts/StorageProjectContext/useStorageProject";
import { useCan } from "@/hooks/Authz/useCan";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { useNavigate } from "@/hooks/Navigation/useNavigate";
import { useResync } from "@/hooks/Realtime/useResync";
import { useObjectListing } from "@/hooks/Storage/useObjectListing";
import { useUploads } from "@/hooks/Storage/useUploads";
import Card from "@/components/Card";
import EmptyBox from "@/components/EmptyBox";
import Loading from "@/components/Loading";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import FileBreadcrumbs from "@/components/Storage/FileBreadcrumbs";
import FileTable from "@/components/Storage/FileTable";
import FileToolbar from "@/components/Storage/FileToolbar";
import UploadPanel from "@/components/Storage/UploadPanel";

/** The folder is part of the URL, so the browser's back button steps out of it. */
const normalizePrefix = (value: string | null): string => {
  if (!value) return "";
  return value.endsWith("/") ? value : `${value}/`;
};

function FilesContent() {
  const { project } = useStorageProject();
  const { storage, refresh: refreshStorage } = useStorage();
  const t = useTranslations("storage.files");
  const searchParams = useSearchParams();
  const { message, modal } = App.useApp();
  const { navigate } = useNavigate();
  const { getErrorMessage } = useErrorMessage();
  const canWrite = useCan("storage.write") && canWriteObjects(storage);
  const readable = canReadObjects(storage);

  const prefix = normalizePrefix(searchParams.get(OBJECT_PREFIX_PARAM));
  const listing = useObjectListing(project.id, storage.id, prefix);

  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);
  // Each object's access is read the first time its row is hovered, never for a whole page
  // at once: it is one request per object.
  const [access, setAccess] = useState<Record<string, boolean>>({});
  const [togglingKey, setTogglingKey] = useState<string | null>(null);

  const openFolder = (next: string) => {
    setSelectedKeys([]);
    const base = storagePath(project.id, storage.id);
    navigate(next ? `${base}?${OBJECT_PREFIX_PARAM}=${encodeURIComponent(next)}` : base);
  };

  // An upload into the folder on screen shows up at once; one into another folder is seen
  // when that folder opens. The size and count move too, so the Storage is read again.
  const onUploaded = useCallback(
    (key: string) => {
      if (parentPrefix(key) === prefix) listing.refresh();
      refreshStorage();
    },
    [prefix, listing.refresh, refreshStorage]
  );
  const uploads = useUploads(project.id, storage.id, onUploaded);

  useResync(listing.refresh);

  const reading = useRef(new Set<string>());
  const readAccess = async (object: StorageObject) => {
    if (object.key in access || reading.current.has(object.key)) return;
    reading.current.add(object.key);
    try {
      const response = await GetObjectAccess(project.id, storage.id, object.key);
      setAccess((known) => ({ ...known, [object.key]: response.data.public }));
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      reading.current.delete(object.key);
    }
  };

  const toggleAccess = async (object: StorageObject, isPublic: boolean) => {
    setTogglingKey(object.key);
    try {
      const response = await SetObjectAccess(project.id, storage.id, {
        key: object.key,
        public: isPublic,
      });
      setAccess((known) => ({ ...known, [object.key]: response.data.public }));
      message.success(t(isPublic ? "access.published" : "access.unpublished"));
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setTogglingKey(null);
    }
  };

  const download = async (object: StorageObject) => {
    setDownloadingKey(object.key);
    try {
      const response = await GetDownloadUrl(project.id, storage.id, { key: object.key });
      // The presigned URL answers from the Storage itself; a new tab keeps the browser here.
      window.open(response.data.url, "_blank", "noopener");
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setDownloadingKey(null);
    }
  };

  const confirmDelete = () => {
    const keys = selectedKeys.slice(0, MAX_OBJECTS_PER_DELETE);
    if (keys.length === 0) return;
    modal.confirm({
      title: t("deleteTitle", { count: keys.length }),
      content: t("deleteConfirm"),
      okText: t("deleteOk"),
      okButtonProps: { danger: true },
      cancelText: t("cancel"),
      centered: true,
      onOk: async () => {
        setDeleting(true);
        try {
          await DeleteObjects(project.id, storage.id, { keys });
          listing.removeKeys(keys);
          setSelectedKeys([]);
          message.success(t("deleted", { count: keys.length }));
          refreshStorage();
        } catch (err) {
          message.error(getErrorMessage(err));
          listing.refresh();
        } finally {
          setDeleting(false);
        }
      },
    });
  };

  const restoreAccess = async () => {
    setRestoring(true);
    try {
      await RestoreBrowserAccess(project.id, storage.id);
      message.success(t("uploads.restored"));
      uploads.retryFailed();
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setRestoring(false);
    }
  };

  const loadMore = async () => {
    const err = await listing.loadMore();
    if (err) message.error(getErrorMessage(err));
  };

  if (!readable) {
    return (
      <Card className="mx-auto w-full max-w-xl">
        <EmptyBox
          icon={<InboxOutlined style={{ fontSize: 26 }} />}
          title={t("unavailableTitle")}
          description={t(
            storage.state === "deleting" ? "unavailableDeleting" : "unavailableStopped"
          )}
        />
      </Card>
    );
  }

  const empty = listing.folders.length === 0 && listing.objects.length === 0;

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FileBreadcrumbs
          bucketName={storage.bucketName}
          prefix={prefix}
          onNavigate={openFolder}
        />
        <FileToolbar
          canWrite={canWrite}
          selectedCount={selectedKeys.length}
          deleting={deleting}
          onUpload={(files) => uploads.add(files, prefix)}
          onDeleteSelected={confirmDelete}
          onRefresh={listing.reload}
        />
      </div>
      {storage.state === "full" && <NoderaAlert variant="warning" message={t("fullHint")} />}
      <UploadPanel
        uploads={uploads.uploads}
        hasBlocked={uploads.hasBlocked}
        restoring={restoring}
        onRestoreAccess={restoreAccess}
        onRetryFailed={uploads.retryFailed}
        onClear={uploads.clearSettled}
      />
      {listing.isLoading ? (
        <Loading />
      ) : listing.error ? (
        <div className="flex flex-col items-start gap-3">
          <NoderaAlert
            variant="error"
            message={getErrorMessage(listing.error)}
            className="w-full"
          />
          <NoderaButton variant="outlined" onClick={listing.reload}>
            {t("retry")}
          </NoderaButton>
        </div>
      ) : empty ? (
        <Card className="mx-auto w-full max-w-xl">
          <EmptyBox
            icon={<InboxOutlined style={{ fontSize: 26 }} />}
            title={prefix ? t("emptyFolderTitle") : t("emptyTitle")}
            description={canWrite ? t("emptyDescription") : t("emptyReadOnly")}
          />
        </Card>
      ) : (
        <Card flush>
          <FileTable
            bucketUrl={storage.url}
            folders={listing.folders}
            objects={listing.objects}
            selectedKeys={selectedKeys}
            onSelectionChange={setSelectedKeys}
            selectable={canWrite}
            downloadable
            downloadingKey={downloadingKey}
            onOpenFolder={openFolder}
            onDownload={download}
            access={access}
            onHoverObject={readAccess}
            publishable={canWrite}
            togglingKey={togglingKey}
            onToggleAccess={toggleAccess}
          />
          {listing.hasMore && (
            <div className="flex justify-center border-t border-border px-6 py-4">
              <NoderaButton
                variant="outlined"
                size="small"
                loading={listing.isLoadingMore}
                onClick={() => void loadMore()}
              >
                {t("loadMore")}
              </NoderaButton>
            </div>
          )}
        </Card>
      )}
      <p className="text-xs leading-4 text-text-muted">{t("tools")}</p>
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <FilesContent />
    </Suspense>
  );
}
