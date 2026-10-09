"use client";

import { useState } from "react";
import { App } from "antd";
import { useTranslations } from "next-intl";
import { DeleteCluster } from "@/api/kubernetes";
import { clustersPath, isClusterAlive } from "@/core/kubernetesApp";
import useCluster from "@/contexts/ClusterContext/useCluster";
import useKubernetesProject from "@/contexts/KubernetesProjectContext/useKubernetesProject";
import { useCan } from "@/hooks/Authz/useCan";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { useNavigate } from "@/hooks/Navigation/useNavigate";
import DeleteClusterCard from "@/components/Kubernetes/DeleteClusterCard";
import DeleteClusterDialog from "@/components/Kubernetes/DeleteClusterDialog";
import KubeconfigCard from "@/components/Kubernetes/KubeconfigCard";
import RenameClusterCard from "@/components/Kubernetes/RenameClusterCard";

export default function Page() {
  const { project } = useKubernetesProject();
  const { cluster, setCluster } = useCluster();
  const t = useTranslations("kubernetes.settings");
  const { message } = App.useApp();
  const { navigate } = useNavigate();
  const { getErrorMessage } = useErrorMessage();
  const canWrite = useCan("kubernetes.write");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const alive = isClusterAlive(cluster);

  const runDelete = async () => {
    setDeleting(true);
    try {
      const response = await DeleteCluster(project.id, cluster.id);
      setCluster(response.data);
      setDeleteOpen(false);
      message.success(t("delete.done", { name: cluster.name }));
      navigate(clustersPath(project.id));
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <KubeconfigCard projectId={project.id} cluster={cluster} canWrite={canWrite} />
      {canWrite && (
        <RenameClusterCard
          projectId={project.id}
          cluster={cluster}
          disabled={!alive}
          onRenamed={setCluster}
        />
      )}
      {canWrite && cluster.status !== "deleting" && (
        <DeleteClusterCard
          cluster={cluster}
          deleting={deleting}
          onDelete={() => setDeleteOpen(true)}
        />
      )}
      <DeleteClusterDialog
        open={deleteOpen}
        name={cluster.name}
        loading={deleting}
        onClose={() => setDeleteOpen(false)}
        onConfirm={runDelete}
      />
    </>
  );
}
