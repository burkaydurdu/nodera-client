"use client";

import { App } from "antd";
import { useTranslations } from "next-intl";
import { ListStoragePackages, ListStorageRegions } from "@/api/storage";
import {
  type Storage,
  type StoragePackage,
  type StorageRegion,
  bySize,
  storagePath,
  storagesPath,
} from "@/core/storageApp";
import useStorageProject from "@/contexts/StorageProjectContext/useStorageProject";
import { useCan } from "@/hooks/Authz/useCan";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { useLatestRead } from "@/hooks/Loading/useLatestRead";
import { useNavigate } from "@/hooks/Navigation/useNavigate";
import Card from "@/components/Card";
import EmptyBox from "@/components/EmptyBox";
import Loading from "@/components/Loading";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import PageHeader from "@/components/PageHeader";
import OpenStorageForm from "@/components/Storage/OpenStorageForm";

export default function Page() {
  const { project } = useStorageProject();
  const t = useTranslations("storage.open");
  const tl = useTranslations("storage.list");
  const { message } = App.useApp();
  const { navigate } = useNavigate();
  const { getErrorMessage } = useErrorMessage();
  const canWrite = useCan("storage.write");

  const regionsRead = useLatestRead<StorageRegion[]>(
    async () => (await ListStorageRegions()).data ?? [],
    "regions",
    []
  );
  const packagesRead = useLatestRead<StoragePackage[]>(
    async () => ((await ListStoragePackages()).data ?? []).slice().sort(bySize),
    "packages",
    []
  );

  const listPath = storagesPath(project.id);

  const handleOpened = (storage: Storage) => {
    message.success(t("opened", { name: storage.bucketName }));
    navigate(storagePath(project.id, storage.id), { replace: true });
  };

  const retry = () => {
    regionsRead.reload();
    packagesRead.reload();
  };

  const header = (
    <PageHeader
      title={t("title")}
      description={t("description", { project: project.name })}
      breadcrumb={[{ label: tl("title"), href: listPath }, { label: t("title") }]}
    />
  );

  if (!canWrite) {
    return (
      <>
        {header}
        <Card className="mx-auto w-full max-w-xl">
          <EmptyBox
            title={t("readOnlyTitle")}
            description={t("readOnly")}
            actionLabel={t("backToList")}
            onAction={() => navigate(listPath)}
          />
        </Card>
      </>
    );
  }

  if (regionsRead.isLoading || packagesRead.isLoading) {
    return (
      <>
        {header}
        <Loading />
      </>
    );
  }

  const failure = regionsRead.error ?? packagesRead.error;
  if (failure) {
    return (
      <>
        {header}
        <div className="flex flex-col items-start gap-3">
          <NoderaAlert variant="error" message={getErrorMessage(failure)} className="w-full" />
          <NoderaButton variant="outlined" onClick={retry}>
            {t("retry")}
          </NoderaButton>
        </div>
      </>
    );
  }

  return (
    <>
      {header}
      <Card className="mx-auto w-full max-w-2xl">
        <OpenStorageForm
          projectId={project.id}
          regions={regionsRead.data}
          packages={packagesRead.data}
          onOpened={handleOpened}
          onCancel={() => navigate(listPath)}
        />
      </Card>
    </>
  );
}
