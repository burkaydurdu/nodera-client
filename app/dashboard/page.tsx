"use client";

import { useEffect, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import { type Project, projectPath } from "@/core/project";
import useProjects from "@/contexts/ProjectContext/useProjects";
import useTeam from "@/contexts/TeamContext/useTeam";
import { useCan } from "@/hooks/Authz/useCan";
import { useNavigate } from "@/hooks/Navigation/useNavigate";
import EmptyBox from "@/components/EmptyBox";
import Loading from "@/components/Loading";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import PageHeader from "@/components/PageHeader";
import CreateProjectModal from "@/components/Projects/CreateProjectModal";
import FirstProjectStep from "@/components/Projects/FirstProjectStep";
import ProjectList from "@/components/Projects/ProjectList";

export default function Page() {
  const t = useTranslations("dashboard.projects");
  const { navigate } = useNavigate();
  const canCreate = useCan("project.write");
  const {
    currentTeam,
    isLoading: teamsLoading,
    error: teamsError,
    reload: reloadTeams,
    lastProjectId,
    rememberProject,
  } = useTeam();
  const {
    projects,
    isLoading: projectsLoading,
    error,
    reload: reloadProjects,
    addProject,
  } = useProjects();
  const [modalOpen, setModalOpen] = useState(false);

  const teamId = currentTeam?.id ?? null;

  // Read again on every visit, so a Project a teammate created shows without a reload; a
  // failure here is the context's to show.
  useEffect(() => {
    setModalOpen(false);
    if (!teamId) return;
    reloadProjects().catch(() => {});
  }, [teamId]);

  const retry = () => {
    reloadProjects().catch(() => {});
  };

  const openProject = (project: Project) => {
    rememberProject(project.id);
    navigate(projectPath(project.id));
  };

  // A fresh Project goes straight to its (empty) Droplet list, which offers the first create.
  const handleCreated = (project: Project) => {
    addProject(project);
    setModalOpen(false);
    navigate(projectPath(project.id));
  };

  if (teamsLoading || (projectsLoading && currentTeam)) {
    return <Loading />;
  }

  if (teamsError) {
    return (
      <>
        <PageHeader title={t("title")} />
        <div className="flex flex-col items-start gap-3">
          <NoderaAlert variant="error" message={teamsError} className="w-full" />
          <NoderaButton variant="outlined" onClick={reloadTeams}>
            {t("retry")}
          </NoderaButton>
        </div>
      </>
    );
  }

  if (!currentTeam) {
    return (
      <>
        <PageHeader title={t("title")} />
        <EmptyBox title={t("noTeamTitle")} description={t("noTeamDescription")} />
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader
          title={t("title")}
          description={t("description", { team: currentTeam.name })}
        />
        <div className="flex flex-col items-start gap-3">
          <NoderaAlert variant="error" message={error} className="w-full" />
          <NoderaButton variant="outlined" onClick={retry}>
            {t("retry")}
          </NoderaButton>
        </div>
      </>
    );
  }

  if (projects.length === 0) {
    return (
      <>
        <PageHeader
          title={t("title")}
          description={t("description", { team: currentTeam.name })}
        />
        {canCreate ? (
          <FirstProjectStep
            key={currentTeam.id}
            teamId={currentTeam.id}
            onCreated={handleCreated}
          />
        ) : (
          <EmptyBox title={t("emptyReadOnlyTitle")} description={t("emptyReadOnly")} />
        )}
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("description", { team: currentTeam.name })}
        extra={
          canCreate ? (
            <NoderaButton
              variant="filled"
              icon={<PlusOutlined />}
              onClick={() => setModalOpen(true)}
            >
              {t("newProject")}
            </NoderaButton>
          ) : undefined
        }
      />
      <ProjectList
        projects={projects}
        activeProjectId={lastProjectId}
        onSelect={openProject}
      />
      <CreateProjectModal
        open={modalOpen}
        teamId={currentTeam.id}
        onClose={() => setModalOpen(false)}
        onCreated={handleCreated}
      />
    </>
  );
}
