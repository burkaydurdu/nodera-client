"use client";

import { App } from "antd";
import { useTranslations } from "next-intl";
import {
  ListKubernetesRegions,
  ListKubernetesVersions,
  ListNodePlans,
} from "@/api/kubernetes";
import {
  type Cluster,
  type KubernetesRegion,
  type KubernetesVersion,
  type NodePlan,
  clusterPath,
  clustersPath,
} from "@/core/kubernetesApp";
import useKubernetesProject from "@/contexts/KubernetesProjectContext/useKubernetesProject";
import { useCan } from "@/hooks/Authz/useCan";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { useLatestRead } from "@/hooks/Loading/useLatestRead";
import { useNavigate } from "@/hooks/Navigation/useNavigate";
import Card from "@/components/Card";
import EmptyBox from "@/components/EmptyBox";
import OpenClusterForm from "@/components/Kubernetes/OpenClusterForm";
import Loading from "@/components/Loading";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import PageHeader from "@/components/PageHeader";

export default function Page() {
  const { project } = useKubernetesProject();
  const t = useTranslations("kubernetes.open");
  const tl = useTranslations("kubernetes.list");
  const { message } = App.useApp();
  const { navigate } = useNavigate();
  const { getErrorMessage } = useErrorMessage();
  const canWrite = useCan("kubernetes.write");

  const regionsRead = useLatestRead<KubernetesRegion[]>(
    async () => (await ListKubernetesRegions()).data ?? [],
    "regions",
    []
  );
  const versionsRead = useLatestRead<KubernetesVersion[]>(
    async () => (await ListKubernetesVersions()).data ?? [],
    "versions",
    []
  );
  // One Region is sold at first; the Plans are those of the first Region offered.
  const region = regionsRead.data[0]?.code ?? null;
  const plansRead = useLatestRead<NodePlan[]>(
    async () => (region ? ((await ListNodePlans(region)).data ?? []) : []),
    `plans:${region ?? ""}`,
    []
  );

  const listPath = clustersPath(project.id);

  const handleOpened = (cluster: Cluster) => {
    message.success(t("opened", { name: cluster.name }));
    navigate(clusterPath(project.id, cluster.id), { replace: true });
  };

  const retry = () => {
    regionsRead.reload();
    versionsRead.reload();
    plansRead.reload();
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

  if (regionsRead.isLoading || versionsRead.isLoading || plansRead.isLoading) {
    return (
      <>
        {header}
        <Loading />
      </>
    );
  }

  const failure = regionsRead.error ?? versionsRead.error ?? plansRead.error;
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

  if (regionsRead.data.length === 0 || versionsRead.data.length === 0) {
    return (
      <>
        {header}
        <Card className="mx-auto w-full max-w-xl">
          <EmptyBox
            title={t("notSoldTitle")}
            description={t("notSold")}
            actionLabel={t("backToList")}
            onAction={() => navigate(listPath)}
          />
        </Card>
      </>
    );
  }

  return (
    <>
      {header}
      <Card className="mx-auto w-full max-w-2xl">
        <OpenClusterForm
          projectId={project.id}
          regions={regionsRead.data}
          versions={versionsRead.data}
          plans={plansRead.data}
          onOpened={handleOpened}
          onCancel={() => navigate(listPath)}
        />
      </Card>
    </>
  );
}
