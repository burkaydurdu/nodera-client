"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { projectApiKeysPath } from "@/core/project";
import useTeam from "@/contexts/TeamContext/useTeam";
import { useCan } from "@/hooks/Authz/useCan";
import { useNavigate } from "@/hooks/Navigation/useNavigate";
import { useProjectInTeam } from "@/hooks/Project/useProjectInTeam";
import Loading from "@/components/Loading";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import PageHeader from "@/components/PageHeader";
import ProjectDetailsCard from "@/components/Projects/ProjectDetailsCard";
import ProjectTabs from "@/components/Projects/ProjectTabs";
import type { ProjectTabKey } from "@/components/Projects/ProjectTabs/type";

export default function Page() {
  const { projectId } = useParams<{ projectId: string }>();
  const t = useTranslations("dashboard.projectSettings");
  const { navigate } = useNavigate();
  const { isLoading: teamsLoading } = useTeam();
  const canManageKeys = useCan("apikey.write");
  const { project, missing, error, retry } = useProjectInTeam(projectId);

  const openTab = (key: ProjectTabKey) => {
    if (key === "apiKeys") navigate(projectApiKeysPath(projectId));
  };

  const header = (
    <>
      <PageHeader
        title={t("title")}
        description={project ? t("description", { project: project.name }) : undefined}
      />
      <ProjectTabs active="general" showApiKeys={canManageKeys} onChange={openTab} />
    </>
  );

  if (teamsLoading || missing || (!project && !error)) {
    return (
      <>
        {header}
        <Loading />
      </>
    );
  }

  if (error || !project) {
    return (
      <>
        {header}
        <div className="flex flex-col items-start gap-3">
          <NoderaAlert variant="error" message={error ?? t("notFound")} className="w-full" />
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
      <ProjectDetailsCard project={project} />
    </>
  );
}
