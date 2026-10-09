"use client";

import { useTranslations } from "next-intl";
import { KUBERNETES_LANDING_PATH } from "@/core/kubernetesApp";
import { KubernetesProjectProvider } from "@/contexts/KubernetesProjectContext/KubernetesProjectContext";
import useTeam from "@/contexts/TeamContext/useTeam";
import { useCan } from "@/hooks/Authz/useCan";
import { useProjectInTeam } from "@/hooks/Project/useProjectInTeam";
import KubernetesAccessDenied from "@/components/Kubernetes/KubernetesAccessDenied";
import Loading from "@/components/Loading";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import PageHeader from "@/components/PageHeader";
import type { KubernetesProjectGateProps } from "./type";

/**
 * What every Kubernetes page stands behind: a Role holding `kubernetes.read` and a Project of
 * the selected Team. A foreign Project (a Team switch, another Team's link) goes back to the
 * Kubernetes landing, which opens the new Team's Project instead.
 */
export default function KubernetesProjectGate({
  projectId,
  children,
}: KubernetesProjectGateProps) {
  const t = useTranslations("kubernetes.gate");
  const canRead = useCan("kubernetes.read");
  const { isLoading: teamsLoading } = useTeam();
  const { project, missing, error, retry } = useProjectInTeam(
    projectId,
    KUBERNETES_LANDING_PATH
  );

  if (teamsLoading) return <Loading />;
  if (!canRead) return <KubernetesAccessDenied />;
  if (error) {
    return (
      <>
        <PageHeader title={t("title")} />
        <div className="flex flex-col items-start gap-3">
          <NoderaAlert variant="error" message={error} className="w-full" />
          <NoderaButton variant="outlined" onClick={retry}>
            {t("retry")}
          </NoderaButton>
        </div>
      </>
    );
  }
  if (missing || !project || project.id !== projectId) return <Loading />;

  return <KubernetesProjectProvider project={project}>{children}</KubernetesProjectProvider>;
}
