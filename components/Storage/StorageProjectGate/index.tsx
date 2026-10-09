"use client";

import { useTranslations } from "next-intl";
import { STORAGE_LANDING_PATH } from "@/core/storageApp";
import { StorageProjectProvider } from "@/contexts/StorageProjectContext/StorageProjectContext";
import useTeam from "@/contexts/TeamContext/useTeam";
import { useCan } from "@/hooks/Authz/useCan";
import { useProjectInTeam } from "@/hooks/Project/useProjectInTeam";
import Loading from "@/components/Loading";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import PageHeader from "@/components/PageHeader";
import StorageAccessDenied from "@/components/Storage/StorageAccessDenied";
import type { StorageProjectGateProps } from "./type";

/**
 * What every Storage page stands behind: a Role holding `storage.read` and a Project of the
 * selected Team. A foreign Project (a Team switch, another Team's link) goes back to the
 * Storage landing, which opens the new Team's Project instead.
 */
export default function StorageProjectGate({ projectId, children }: StorageProjectGateProps) {
  const t = useTranslations("storage.gate");
  const canRead = useCan("storage.read");
  const { isLoading: teamsLoading } = useTeam();
  const { project, missing, error, retry } = useProjectInTeam(projectId, STORAGE_LANDING_PATH);

  if (teamsLoading) return <Loading />;
  if (!canRead) return <StorageAccessDenied />;
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

  return <StorageProjectProvider project={project}>{children}</StorageProjectProvider>;
}
