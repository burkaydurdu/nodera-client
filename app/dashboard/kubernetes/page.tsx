"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ClusterOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import {
  KUBERNETES_LANDING_PATH,
  KUBERNETES_PROJECT_PARAM,
  KUBERNETES_CLUSTER_PARAM,
  KUBERNETES_TEAM_PARAM,
  clusterPath,
  clustersPath,
} from "@/core/kubernetesApp";
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
import KubernetesAccessDenied from "@/components/Kubernetes/KubernetesAccessDenied";

const landingPathFor = (projectId: string | null, clusterId: string | null): string => {
  const params = new URLSearchParams();
  if (projectId) params.set(KUBERNETES_PROJECT_PARAM, projectId);
  if (projectId && clusterId) params.set(KUBERNETES_CLUSTER_PARAM, clusterId);
  const query = params.toString();
  return query ? `${KUBERNETES_LANDING_PATH}?${query}` : KUBERNETES_LANDING_PATH;
};

/**
 * The Kubernetes App's entry: it opens the Clusters of a Project. A Cluster notification links
 * here with `?team=&project=&cluster=`: a member is switched to that Team (the parameter then
 * leaves the URL, so a later switch in the Team menu is not undone, as on billing links), the
 * Project is remembered and the Cluster opens; a Team or a Project the user cannot open reads
 * as not found rather than showing another one's Clusters. Without a link the remembered
 * Project opens, or the first step when the Team has none.
 */
function KubernetesLandingContent() {
  const t = useTranslations("kubernetes.landing");
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
  const canRead = useCan("kubernetes.read");
  const canCreate = useCan("project.write");
  const [modalOpen, setModalOpen] = useState(false);
  const [projectNotFound, setProjectNotFound] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  // The linked Project a fresh read was asked for; its answer decides, not the list on screen.
  const checkedProject = useRef<string | null>(null);
  const mounted = useRef(true);

  const teamParam = searchParams.get(KUBERNETES_TEAM_PARAM);
  const projectParam = searchParams.get(KUBERNETES_PROJECT_PARAM);
  const clusterParam = searchParams.get(KUBERNETES_CLUSTER_PARAM);

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
    navigate(landingPathFor(projectParam, clusterParam), { replace: true });
  }, [teamParam, teamsLoading, currentTeam?.id, linkedTeamKnown]);

  const openProject = (projectId: string) => {
    rememberProject(projectId);
    // The Cluster page itself says when the linked Cluster is gone.
    navigate(clusterParam ? clusterPath(projectId, clusterParam) : clustersPath(projectId), {
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
    navigate(KUBERNETES_LANDING_PATH, { replace: true });
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
    navigate(clustersPath(project.id));
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

  if (!canRead) return <KubernetesAccessDenied />;

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
          icon={<ClusterOutlined style={{ fontSize: 26 }} />}
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
      <KubernetesLandingContent />
    </Suspense>
  );
}
