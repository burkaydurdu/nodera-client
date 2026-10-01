"use client";

import { useCallback, useEffect, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import { GetProjects } from "@/api/projects";
import type { Project } from "@/core/project";
import { getLastProjectId } from "@/core/storage";
import useTeam from "@/contexts/TeamContext/useTeam";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
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
  const { getErrorMessage } = useErrorMessage();
  const { navigate } = useNavigate();
  const {
    currentTeam,
    isLoading: teamsLoading,
    error: teamsError,
    reload: reloadTeams,
    rememberProject,
  } = useTeam();

  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const teamId = currentTeam?.id ?? null;

  const load = useCallback(async () => {
    if (!teamId) {
      setProjects([]);
      setActiveProjectId(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await GetProjects(teamId);
      const list = response.data ?? [];
      setProjects(list);

      // The persisted value is read directly so that remembering the fallback Project below
      // does not re-run this load.
      const remembered = getLastProjectId();
      const active = list.find((p) => p.id === remembered) ?? list[0] ?? null;
      if (active) {
        rememberProject(active.id);
        setActiveProjectId(active.id);
      } else {
        setActiveProjectId(null);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [teamId, getErrorMessage, rememberProject]);

  useEffect(() => {
    if (teamsLoading) return;
    setModalOpen(false);
    load();
  }, [load, teamsLoading]);

  const openProject = (project: Project) => {
    rememberProject(project.id);
    setActiveProjectId(project.id);
    navigate(`/dashboard/projects/${project.id}`);
  };

  // A fresh Project goes straight to its (empty) Droplet list, which offers the first create.
  const handleCreated = (project: Project) => {
    setProjects((list) => [project, ...list]);
    setModalOpen(false);
    openProject(project);
  };

  const handleSelect = (project: Project) => {
    openProject(project);
  };

  if (teamsLoading || (loading && currentTeam)) {
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
          <NoderaButton variant="outlined" onClick={load}>
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
        <FirstProjectStep
          key={currentTeam.id}
          teamId={currentTeam.id}
          onCreated={handleCreated}
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("description", { team: currentTeam.name })}
        extra={
          <NoderaButton
            variant="filled"
            icon={<PlusOutlined />}
            onClick={() => setModalOpen(true)}
          >
            {t("newProject")}
          </NoderaButton>
        }
      />
      <ProjectList
        projects={projects}
        activeProjectId={activeProjectId}
        onSelect={handleSelect}
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
