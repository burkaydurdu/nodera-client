"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DatabaseOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import {
  STORAGE_LANDING_PATH,
  STORAGE_PROJECT_PARAM,
  STORAGE_STORAGE_PARAM,
  STORAGE_TEAM_PARAM,
  storagePath,
  storagesPath,
} from "@/core/storageApp";
import type { Project } from "@/core/project";
import useProjects from "@/contexts/ProjectContext/useProjects";
import useTeam from "@/contexts/TeamContext/useTeam";
import { useCan } from "@/hooks/Authz/useCan";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { useNavigate } from "@/hooks/Navigation/useNavigate";
import Card from "@/components/Card";
import EmptyBox from "@/components/EmptyBox";
import Loading from "@/components/Loading";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import PageHeader from "@/components/PageHeader";
import CreateProjectModal from "@/components/Projects/CreateProjectModal";
import StorageAccessDenied from "@/components/Storage/StorageAccessDenied";

const landingPathFor = (projectId: string | null, storageId: string | null): string => {
  const params = new URLSearchParams();
  if (projectId) params.set(STORAGE_PROJECT_PARAM, projectId);
  if (projectId && storageId) params.set(STORAGE_STORAGE_PARAM, storageId);
  const query = params.toString();
  return query ? `${STORAGE_LANDING_PATH}?${query}` : STORAGE_LANDING_PATH;
};

/**
 * The Storage App's entry: it opens the Storages of a Project. A Storage notification links
 * here with `?team=&project=&storage=`: a member is switched to that Team (the parameter then
 * leaves the URL, so a later switch in the Team menu is not undone, as on billing links), the
 * Project is remembered and the Storage opens; a Team or a Project the user cannot open reads
 * as not found rather than showing another one's Storages. Without a link the remembered
 * Project opens, or the first step when the Team has none.
 */
function StorageLandingContent() {
  const t = useTranslations("storage.landing");
  const searchParams = useSearchParams();
  const { navigate } = useNavigate();
  const { getErrorMessage } = useErrorMessage();
  const {
    teams,
    currentTeam,
    isLoading: teamsLoading,
    error: teamsError,
    reload: reloadTeams,
    selectTeam,
    rememberProject,
  } = useTeam();
  const {
    projects,
    currentProject,
    isLoading: projectsLoading,
    error: projectsError,
    reload: reloadProjects,
    addProject,
  } = useProjects();
  const canRead = useCan("storage.read");
  const canCreate = useCan("project.write");
  const [modalOpen, setModalOpen] = useState(false);
  const [projectNotFound, setProjectNotFound] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  // The linked Project a fresh read was asked for; its answer decides, not the list on screen.
  const checkedProject = useRef<string | null>(null);
  const mounted = useRef(true);

  const teamParam = searchParams.get(STORAGE_TEAM_PARAM);
  const projectParam = searchParams.get(STORAGE_PROJECT_PARAM);
  const storageParam = searchParams.get(STORAGE_STORAGE_PARAM);

  const linkedTeamKnown = !!teamParam && teams.some((team) => team.id === teamParam);
  // Only once the user's Teams are known: a failed read is not a missing Team.
  const teamNotFound =
    !!teamParam &&
    !teamsLoading &&
    !teamsError &&
    currentTeam?.id !== teamParam &&
    !linkedTeamKnown;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!teamParam || teamsLoading) return;
    if (currentTeam?.id !== teamParam) {
      if (linkedTeamKnown) selectTeam(teamParam);
      return;
    }
    navigate(landingPathFor(projectParam, storageParam), { replace: true });
  }, [teamParam, teamsLoading, currentTeam?.id, linkedTeamKnown]);

  const openProject = (projectId: string) => {
    rememberProject(projectId);
    // The Storage page itself says when the linked Storage is gone.
    navigate(storageParam ? storagePath(projectId, storageParam) : storagesPath(projectId), {
      replace: true,
    });
  };

  // The list may predate the Project (a teammate created it a moment ago): a fresh read decides.
  const confirmLinkedProject = (projectId: string) => {
    checkedProject.current = projectId;
    setLinkError(null);
    reloadProjects()
      .then((list) => {
        if (!mounted.current) return;
        if (list.some((project) => project.id === projectId)) openProject(projectId);
        else setProjectNotFound(true);
      })
      .catch((err) => {
        if (mounted.current) setLinkError(getErrorMessage(err));
      });
  };

  useEffect(() => {
    if (teamParam || teamsLoading || projectsLoading || !currentTeam || projectsError) return;
    if (projectParam) {
      if (checkedProject.current === projectParam) return;
      if (projects.some((project) => project.id === projectParam)) openProject(projectParam);
      else confirmLinkedProject(projectParam);
      return;
    }
    if (currentProject) openProject(currentProject.id);
  }, [
    teamParam,
    teamsLoading,
    projectsLoading,
    projectsError,
    currentTeam?.id,
    projectParam,
    projects,
    currentProject?.id,
  ]);

  const openWithoutLink = () => {
    setProjectNotFound(false);
    setLinkError(null);
    checkedProject.current = null;
    navigate(STORAGE_LANDING_PATH, { replace: true });
  };

  const retry = () => {
    if (projectParam && !projectsError) {
      confirmLinkedProject(projectParam);
      return;
    }
    reloadProjects().catch(() => {
      // Kept as the context's error, shown here again.
    });
  };

  const handleCreated = (project: Project) => {
    addProject(project);
    setModalOpen(false);
    navigate(storagesPath(project.id));
  };

  const header = <PageHeader title={t("title")} description={t("description")} />;

  if (teamNotFound) {
    return (
      <>
        {header}
        <Card className="mx-auto w-full max-w-xl">
          <EmptyBox
            title={t("teamNotFoundTitle")}
            description={t("teamNotFound")}
            actionLabel={currentTeam ? t("openCurrent") : undefined}
            onAction={currentTeam ? openWithoutLink : undefined}
          />
        </Card>
      </>
    );
  }

  // A linked Team is being selected, or its parameter is leaving the URL.
  if (teamsLoading || (teamParam && !teamsError) || (projectsLoading && currentTeam)) {
    return <Loading />;
  }

  if (teamsError || !currentTeam) {
    return (
      <>
        {header}
        <div className="flex flex-col items-start gap-3">
          <NoderaAlert
            variant="error"
            message={teamsError ?? t("noTeam")}
            className="w-full"
          />
          <NoderaButton variant="outlined" onClick={reloadTeams}>
            {t("retry")}
          </NoderaButton>
        </div>
      </>
    );
  }

  if (!canRead) return <StorageAccessDenied />;

  if (projectNotFound) {
    return (
      <>
        {header}
        <Card className="mx-auto w-full max-w-xl">
          <EmptyBox
            title={t("projectNotFoundTitle")}
            description={t("projectNotFound", { team: currentTeam.name })}
            actionLabel={projects.length > 0 ? t("openCurrent") : undefined}
            onAction={projects.length > 0 ? openWithoutLink : undefined}
          />
        </Card>
      </>
    );
  }

  const shownError = projectsError ?? linkError;
  if (shownError) {
    return (
      <>
        {header}
        <div className="flex flex-col items-start gap-3">
          <NoderaAlert variant="error" message={shownError} className="w-full" />
          <NoderaButton variant="outlined" onClick={retry}>
            {t("retry")}
          </NoderaButton>
        </div>
      </>
    );
  }

  if (projects.length > 0) {
    // On its way to a Project's overview.
    return <Loading />;
  }

  return (
    <>
      {header}
      <Card className="mx-auto w-full max-w-xl">
        <EmptyBox
          icon={<DatabaseOutlined style={{ fontSize: 26 }} />}
          title={t("noProjectTitle")}
          description={canCreate ? t("noProject") : t("noProjectReadOnly")}
          actionLabel={canCreate ? t("createProject") : undefined}
          onAction={canCreate ? () => setModalOpen(true) : undefined}
        />
      </Card>
      <CreateProjectModal
        open={modalOpen}
        teamId={currentTeam.id}
        onClose={() => setModalOpen(false)}
        onCreated={handleCreated}
      />
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <StorageLandingContent />
    </Suspense>
  );
}
