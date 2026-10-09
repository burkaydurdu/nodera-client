"use client";

import { useState } from "react";
import { App } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import { DeleteNodePool, ListNodePlans, ResizeNodePool } from "@/api/kubernetes";
import {
  MAX_POOLS_PER_CLUSTER,
  type NodePlan,
  type NodePool,
  isClusterAlive,
  kubernetesBillingBlock,
} from "@/core/kubernetesApp";
import useCluster from "@/contexts/ClusterContext/useCluster";
import useKubernetesProject from "@/contexts/KubernetesProjectContext/useKubernetesProject";
import { useCan } from "@/hooks/Authz/useCan";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { useLatestRead } from "@/hooks/Loading/useLatestRead";
import AddNodePoolModal from "@/components/Kubernetes/AddNodePoolModal";
import NodePoolCard from "@/components/Kubernetes/NodePoolCard";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";

/** The Overview: every Node pool with its Nodes, and the way to add, grow, shrink or drop one. */
export default function Page() {
  const { project } = useKubernetesProject();
  const { cluster, nodes, refresh, setCluster } = useCluster();
  const t = useTranslations("kubernetes.overview");
  const { message, modal } = App.useApp();
  const { getErrorMessage } = useErrorMessage();
  const canWrite = useCan("kubernetes.write");
  const [addOpen, setAddOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const plansRead = useLatestRead<NodePlan[]>(
    async () => (await ListNodePlans(cluster.region)).data ?? [],
    `plans:${cluster.region}`,
    []
  );

  const frozen = !isClusterAlive(cluster);
  const blocked = kubernetesBillingBlock(cluster);
  const atLimit = cluster.nodePools.length >= MAX_POOLS_PER_CLUSTER;

  const resize = async (pool: NodePool, count: number): Promise<boolean> => {
    setBusy(true);
    try {
      const response = await ResizeNodePool(project.id, cluster.id, pool.id, { count });
      setCluster(response.data);
      refresh();
      message.success(
        count > pool.count
          ? t("grown", { pool: pool.name, count })
          : t("shrunk", { pool: pool.name, count })
      );
      return true;
    } catch (err) {
      message.error(getErrorMessage(err));
      refresh();
      return false;
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = (pool: NodePool) => {
    modal.confirm({
      title: t("deletePool.title", { pool: pool.name }),
      content: t("deletePool.content", { count: pool.count }),
      okText: t("deletePool.confirm"),
      okButtonProps: { danger: true },
      cancelText: t("deletePool.cancel"),
      centered: true,
      onOk: async () => {
        setBusy(true);
        try {
          const response = await DeleteNodePool(project.id, cluster.id, pool.id);
          setCluster(response.data);
          refresh();
          message.success(t("deletePool.done", { pool: pool.name }));
        } catch (err) {
          message.error(getErrorMessage(err));
          refresh();
        } finally {
          setBusy(false);
        }
      },
    });
  };

  return (
    <>
      {blocked && canWrite && !frozen && (
        <NoderaAlert variant="warning" message={t(`blocked.${blocked}`)} />
      )}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-text">
          {t("poolsTitle", { count: cluster.nodePools.length })}
        </h2>
        {canWrite && !frozen && (
          <NoderaButton
            variant="outlined"
            icon={<PlusOutlined />}
            onClick={() => setAddOpen(true)}
            disabled={atLimit || busy || blocked !== null}
          >
            {t("addPool")}
          </NoderaButton>
        )}
      </div>
      {atLimit && canWrite && (
        <NoderaAlert variant="info" message={t("poolLimit", { max: MAX_POOLS_PER_CLUSTER })} />
      )}
      {cluster.nodePools.map((pool) => (
        <NodePoolCard
          key={pool.id}
          pool={pool}
          nodes={nodes}
          canWrite={canWrite}
          frozen={frozen}
          last={cluster.nodePools.length <= 1}
          busy={busy}
          onResize={resize}
          onDelete={confirmDelete}
        />
      ))}
      <AddNodePoolModal
        open={addOpen}
        projectId={project.id}
        cluster={cluster}
        plans={plansRead.data}
        onClose={() => setAddOpen(false)}
        onAdded={(updated) => {
          setCluster(updated);
          refresh();
          setAddOpen(false);
          message.success(t("poolAdded"));
        }}
      />
    </>
  );
}
