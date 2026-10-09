"use client";

import { ClusterOutlined, PlusOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import { ListClusters } from "@/api/kubernetes";
import { ErrorCode } from "@/core/error";
import {
  type Cluster,
  MAX_CLUSTERS_PER_PROJECT,
  clusterPath,
  newClusterPath,
} from "@/core/kubernetesApp";
import { PROJECT_ACCESS_RETRY_INTERVAL_MS, PROJECT_ACCESS_RETRY_MS } from "@/core/project";
import useKubernetesProject from "@/contexts/KubernetesProjectContext/useKubernetesProject";
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
import ClusterTable from "@/components/Kubernetes/ClusterTable";
import Loading from "@/components/Loading";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import PageHeader from "@/components/PageHeader";

export default function Page() {
  const { project } = useKubernetesProject();
  const t = useTranslations("kubernetes.list");
  const { navigate } = useNavigate();
  const { getErrorMessage } = useErrorMessage();
  const canWrite = useCan("kubernetes.write");

  const clustersRead = useLatestRead<Cluster[]>(
    async (first, signal) =>
      // Kubernetes learns a Project from an event (ADR-0004): right after the Project was
      // created its list answers "not found" for a moment, so the first read is retried briefly.
      (
        await retryUntil(() => ListClusters(project.id), {
          shouldRetry: (err) => first && IsErrorCode(err, ErrorCode.KubernetesProjectNotFound),
          timeoutMs: PROJECT_ACCESS_RETRY_MS,
          intervalMs: PROJECT_ACCESS_RETRY_INTERVAL_MS,
          signal,
        })
      ).data ?? [],
    project.id,
    []
  );
  const clusters = clustersRead.data;

  useRealtimeMessage("kubernetes.cluster_changed", (change) => {
    if (change.projectId === project.id) clustersRead.refresh();
  });
  useResync(clustersRead.refresh);

  const atLimit = clusters.length >= MAX_CLUSTERS_PER_PROJECT;
  const openNew = () => navigate(newClusterPath(project.id));

  const header = (
    <PageHeader
      title={t("title")}
      description={t("description", { project: project.name })}
      extra={
        canWrite && clusters.length > 0 ? (
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

  if (clustersRead.isLoading) {
    return (
      <>
        {header}
        <Loading />
      </>
    );
  }

  if (clustersRead.error) {
    return (
      <>
        {header}
        <div className="flex flex-col items-start gap-3">
          {IsErrorCode(clustersRead.error, ErrorCode.KubernetesProjectNotFound) ? (
            <NoderaAlert
              variant="info"
              message={t("accessPendingTitle")}
              description={t("accessPending")}
              className="w-full"
            />
          ) : (
            <NoderaAlert
              variant="error"
              message={getErrorMessage(clustersRead.error)}
              className="w-full"
            />
          )}
          <NoderaButton variant="outlined" onClick={clustersRead.reload}>
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
          message={t("limitReached", { max: MAX_CLUSTERS_PER_PROJECT })}
        />
      )}
      {clusters.length === 0 ? (
        <Card className="mx-auto w-full max-w-xl">
          <EmptyBox
            icon={<ClusterOutlined style={{ fontSize: 26 }} />}
            title={t("emptyTitle")}
            description={canWrite ? t("emptyDescription") : t("emptyReadOnly")}
            actionLabel={canWrite ? t("open") : undefined}
            onAction={canWrite ? openNew : undefined}
          />
        </Card>
      ) : (
        <Card flush>
          <ClusterTable
            clusters={clusters}
            onOpen={(cluster) => navigate(clusterPath(project.id, cluster.id))}
          />
        </Card>
      )}
    </>
  );
}
