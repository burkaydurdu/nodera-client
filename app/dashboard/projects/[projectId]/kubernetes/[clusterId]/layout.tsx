"use client";

import { useParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { GetCluster, ListClusterNodes } from "@/api/kubernetes";
import { ErrorCode } from "@/core/error";
import {
  CLUSTER_FALLBACK_POLL_INTERVAL_MS,
  CLUSTER_SECTIONS,
  type Cluster,
  type ClusterNode,
  type ClusterSection,
  clusterPath,
  clustersPath,
  isClusterTransitional,
} from "@/core/kubernetesApp";
import { ClusterProvider } from "@/contexts/ClusterContext/ClusterContext";
import useKubernetesProject from "@/contexts/KubernetesProjectContext/useKubernetesProject";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { useLatestRead } from "@/hooks/Loading/useLatestRead";
import { useNavigate } from "@/hooks/Navigation/useNavigate";
import { usePolling } from "@/hooks/Polling/usePolling";
import { useRealtimeMessage } from "@/hooks/Realtime/useRealtimeMessage";
import { useResync } from "@/hooks/Realtime/useResync";
import { IsErrorCode } from "@/utils/error";
import Card from "@/components/Card";
import EmptyBox from "@/components/EmptyBox";
import ClusterStatusAlert from "@/components/Kubernetes/ClusterStatusAlert";
import ClusterStatusBadge from "@/components/Kubernetes/ClusterStatusBadge";
import ClusterTabs from "@/components/Kubernetes/ClusterTabs";
import type { ClusterTabKey } from "@/components/Kubernetes/ClusterTabs/type";
import Loading from "@/components/Loading";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import NoderaCopyButton from "@/components/NoderaCopyButton";
import PageHeader from "@/components/PageHeader";

const isSection = (value: string | undefined): value is ClusterSection =>
  !!value && (CLUSTER_SECTIONS as readonly string[]).includes(value);

/**
 * The shell of one Cluster: it reads the Cluster and its Nodes once for the Overview and the
 * Settings, draws its name, status, banner and tabs over them, refetches on
 * `kubernetes.cluster_changed` and polls while the jobs may still move it. The pages take
 * both from the context.
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  const { clusterId } = useParams<{ clusterId: string }>();
  const pathname = usePathname();
  const { project } = useKubernetesProject();
  const t = useTranslations("kubernetes.detail");
  const tl = useTranslations("kubernetes.list");
  const { navigate } = useNavigate();
  const { getErrorMessage } = useErrorMessage();

  const key = `${project.id}:${clusterId}`;
  const clusterRead = useLatestRead<Cluster | null>(
    async () => (await GetCluster(project.id, clusterId)).data,
    key,
    null
  );
  const nodesRead = useLatestRead<ClusterNode[]>(
    async () => (await ListClusterNodes(project.id, clusterId)).data ?? [],
    key,
    []
  );
  const cluster = clusterRead.data;

  const refresh = () => {
    clusterRead.refresh();
    nodesRead.refresh();
  };

  // A Node joining or leaving is pushed; the poll only covers a push that never arrived.
  usePolling(
    async () => refresh(),
    CLUSTER_FALLBACK_POLL_INTERVAL_MS,
    !!cluster &&
      (isClusterTransitional(cluster) || nodesRead.data.some((n) => n.status !== "ready"))
  );
  useRealtimeMessage("kubernetes.cluster_changed", (change) => {
    if (change.clusterId === clusterId) refresh();
  });
  useResync(refresh);

  const listPath = clustersPath(project.id);
  const section = pathname.slice(clusterPath(project.id, clusterId).length + 1).split("/")[0];
  const activeTab: ClusterTabKey = isSection(section) ? section : "overview";

  const openTab = (tab: ClusterTabKey) =>
    navigate(
      tab === "overview"
        ? clusterPath(project.id, clusterId)
        : clusterPath(project.id, clusterId, tab)
    );

  const breadcrumb = [
    { label: tl("title"), href: listPath },
    { label: cluster?.name ?? t("title") },
  ];

  if (clusterRead.isLoading) {
    return (
      <>
        <PageHeader title={t("title")} breadcrumb={breadcrumb} />
        <Loading />
      </>
    );
  }

  if (IsErrorCode(clusterRead.error, ErrorCode.ClusterNotFound)) {
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

  if (clusterRead.error || !cluster) {
    return (
      <>
        <PageHeader title={t("title")} breadcrumb={breadcrumb} />
        <div className="flex flex-col items-start gap-3">
          <NoderaAlert
            variant="error"
            message={
              clusterRead.error ? getErrorMessage(clusterRead.error) : t("notFoundTitle")
            }
            className="w-full"
          />
          <NoderaButton variant="outlined" onClick={clusterRead.reload}>
            {t("retry")}
          </NoderaButton>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={cluster.name}
        description={t("description", { region: cluster.region, version: cluster.version })}
        breadcrumb={breadcrumb}
        extra={<ClusterStatusBadge status={cluster.status} />}
      />
      <div className="-mt-2 mb-4 flex min-w-0 items-center gap-1 text-sm">
        <span className="shrink-0 text-text-muted">{t("endpoint")}</span>
        <span className="truncate font-mono text-text" title={cluster.endpoint}>
          {cluster.endpoint}
        </span>
        <NoderaCopyButton value={cluster.endpoint} label={t("copyEndpoint")} />
      </div>
      <ClusterStatusAlert cluster={cluster} />
      <ClusterTabs active={activeTab} onChange={openTab} />
      <ClusterProvider
        cluster={cluster}
        nodes={nodesRead.data}
        refresh={refresh}
        setCluster={clusterRead.setData}
      >
        {children}
      </ClusterProvider>
    </>
  );
}
