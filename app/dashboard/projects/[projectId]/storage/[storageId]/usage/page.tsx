"use client";

import { useTranslations } from "next-intl";
import { GetStorageUsage } from "@/api/storage";
import { type StorageUsage, USAGE_DAYS } from "@/core/storageApp";
import useStorage from "@/contexts/StorageContext/useStorage";
import useStorageProject from "@/contexts/StorageProjectContext/useStorageProject";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { useLatestRead } from "@/hooks/Loading/useLatestRead";
import { useRealtimeMessage } from "@/hooks/Realtime/useRealtimeMessage";
import { useResync } from "@/hooks/Realtime/useResync";
import Card from "@/components/Card";
import EmptyBox from "@/components/EmptyBox";
import Loading from "@/components/Loading";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import StorageSizeCard from "@/components/Storage/StorageSizeCard";
import UsageTrafficTable from "@/components/Storage/UsageTrafficTable";

export default function Page() {
  const { project } = useStorageProject();
  const { storage } = useStorage();
  const t = useTranslations("storage.usage");
  const { getErrorMessage } = useErrorMessage();

  const usageRead = useLatestRead<StorageUsage | null>(
    async () => (await GetStorageUsage(project.id, storage.id)).data,
    `${project.id}:${storage.id}`,
    null
  );

  useRealtimeMessage("storage.changed", (change) => {
    if (change.storageId === storage.id) usageRead.refresh();
  });
  useResync(usageRead.refresh);

  // Newest first, whatever order the service listed them in.
  const days = (usageRead.data?.days ?? []).slice().sort((a, b) => b.day.localeCompare(a.day));

  return (
    <>
      <StorageSizeCard storage={storage} />
      <Card
        title={t("trafficTitle")}
        description={t("trafficDescription", { days: USAGE_DAYS })}
        flush={days.length > 0}
      >
        {usageRead.isLoading ? (
          <Loading />
        ) : usageRead.error ? (
          <div className="flex flex-col items-start gap-3">
            <NoderaAlert
              variant="error"
              message={getErrorMessage(usageRead.error)}
              className="w-full"
            />
            <NoderaButton variant="outlined" onClick={usageRead.reload}>
              {t("retry")}
            </NoderaButton>
          </div>
        ) : days.length === 0 ? (
          <EmptyBox title={t("noTrafficTitle")} description={t("noTraffic")} />
        ) : (
          <>
            <UsageTrafficTable days={days} />
            <p className="px-6 py-4 text-xs leading-4 text-text-muted">{t("trafficNote")}</p>
          </>
        )}
      </Card>
    </>
  );
}
