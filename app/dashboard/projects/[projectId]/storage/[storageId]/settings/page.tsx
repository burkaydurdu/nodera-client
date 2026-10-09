"use client";

import { useState } from "react";
import { App } from "antd";
import { useLocale, useTranslations } from "next-intl";
import { ChooseStoragePackage, DeleteStorage, ListStoragePackages } from "@/api/storage";
import {
  type StoragePackage,
  type StoragePackageAction,
  bySize,
  isDeleting,
  storagePackageBlock,
  storagePath,
  storagesPath,
} from "@/core/storageApp";
import useStorage from "@/contexts/StorageContext/useStorage";
import useStorageProject from "@/contexts/StorageProjectContext/useStorageProject";
import { useCan } from "@/hooks/Authz/useCan";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { useLatestRead } from "@/hooks/Loading/useLatestRead";
import { useNavigate } from "@/hooks/Navigation/useNavigate";
import { formatUtcDate } from "@/utils/date";
import { formatStorageSize } from "@/utils/number";
import { formatUsd } from "@/utils/price";
import Loading from "@/components/Loading";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import ConnectionDetailsCard from "@/components/Storage/ConnectionDetailsCard";
import DeleteStorageCard from "@/components/Storage/DeleteStorageCard";
import DeleteStorageDialog from "@/components/Storage/DeleteStorageDialog";
import StoragePackageCard from "@/components/Storage/StoragePackageCard";
import StoragePackagePicker from "@/components/Storage/StoragePackagePicker";

type ConfirmedAction = Extract<StoragePackageAction, "upgrade" | "downgrade">;

export default function Page() {
  const { project } = useStorageProject();
  const { storage, setStorage, refresh } = useStorage();
  const t = useTranslations("storage.settings");
  const tp = useTranslations("storage.packages");
  const locale = useLocale();
  const { message, modal } = App.useApp();
  const { navigate } = useNavigate();
  const { getErrorMessage } = useErrorMessage();
  const canWrite = useCan("storage.write");
  const canRead = useCan("storage.read");
  const [busyCode, setBusyCode] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const packagesRead = useLatestRead<StoragePackage[]>(
    async () => ((await ListStoragePackages()).data ?? []).slice().sort(bySize),
    "packages",
    []
  );

  const applyPackage = async (code: string, success: string) => {
    setBusyCode(code);
    try {
      const response = await ChooseStoragePackage(project.id, storage.id, { code });
      setStorage(response.data);
      message.success(success);
    } catch (err) {
      message.error(getErrorMessage(err));
      // The refusal may come from a change made elsewhere: the Storage is read again.
      refresh();
    } finally {
      setBusyCode(null);
    }
  };

  const confirmPackage = (pkg: StoragePackage, action: StoragePackageAction) => {
    if (action === "current" || action === "scheduled") return;
    const values = {
      package: pkg.code,
      size: formatStorageSize(pkg.sizeBytes, locale),
      price: formatUsd(pkg.monthlyPrice),
      date: formatUtcDate(storage.scheduledChange?.effectiveAt, locale),
    };
    // Keeping the current Package only undoes a scheduled change: nothing to confirm.
    if (action === "keep") {
      void applyPackage(pkg.code, tp("done.keep", values));
      return;
    }
    const confirmed: ConfirmedAction = action;
    modal.confirm({
      title: tp(`confirm.${confirmed}.title`, values),
      content: tp(`confirm.${confirmed}.description`, values),
      okText: tp(`confirm.${confirmed}.ok`),
      cancelText: tp("back"),
      centered: true,
      onOk: () => applyPackage(pkg.code, tp(`done.${confirmed}`, values)),
    });
  };

  const undoScheduledChange = () =>
    void applyPackage(
      storage.package.code,
      tp("done.keep", { package: storage.package.code })
    );

  const deleteStorage = async (typedName: string) => {
    setDeleting(true);
    try {
      await DeleteStorage(project.id, storage.id, typedName);
      message.success(t("delete.done", { name: storage.bucketName }));
      navigate(storagesPath(project.id), { replace: true });
    } catch (err) {
      message.error(getErrorMessage(err));
      setDeleting(false);
    }
  };

  const blocked = storagePackageBlock(storage);
  const deletingStorage = isDeleting(storage);

  return (
    <>
      <ConnectionDetailsCard
        storage={storage}
        accessKeysPath={canRead ? storagePath(project.id, storage.id, "access-keys") : null}
      />
      <StoragePackageCard
        storage={storage}
        canWrite={canWrite && !deletingStorage}
        blocked={blocked}
        busy={busyCode !== null}
        onUndo={undoScheduledChange}
      />
      {!deletingStorage &&
        (packagesRead.isLoading ? (
          <Loading />
        ) : packagesRead.error ? (
          <div className="flex flex-col items-start gap-3">
            <NoderaAlert
              variant="error"
              message={getErrorMessage(packagesRead.error)}
              className="w-full"
            />
            <NoderaButton variant="outlined" onClick={packagesRead.reload}>
              {t("retry")}
            </NoderaButton>
          </div>
        ) : (
          <StoragePackagePicker
            packages={packagesRead.data}
            storage={storage}
            canWrite={canWrite}
            blocked={blocked}
            busyCode={busyCode}
            onSelect={confirmPackage}
          />
        ))}
      {canWrite && !deletingStorage && (
        <>
          <DeleteStorageCard
            storage={storage}
            deleting={deleting}
            onDelete={() => setDeleteOpen(true)}
          />
          <DeleteStorageDialog
            open={deleteOpen}
            bucketName={storage.bucketName}
            loading={deleting}
            onClose={() => setDeleteOpen(false)}
            onConfirm={deleteStorage}
          />
        </>
      )}
    </>
  );
}
