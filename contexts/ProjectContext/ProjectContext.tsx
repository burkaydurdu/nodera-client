"use client";

import { createContext, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { GetProjects } from "@/api/projects";
import type { Project } from "@/core/project";
import { getLastProjectId } from "@/core/storage";
import useTeam from "../TeamContext/useTeam";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import type { ProjectContextValues } from "./Types";

const NO_PROJECTS: Project[] = [];

const ProjectContext = createContext<ProjectContextValues>({
  projects: NO_PROJECTS,
  currentProject: null,
  isLoading: false,
  error: null,
  reload: () => Promise.resolve(NO_PROJECTS),
  addProject: () => {},
});

interface LoadedProjects {
  teamId: string;
  items: Project[];
}

interface FailedLoad {
  teamId: string;
  message: string;
}

/**
 * The selected Team's Projects: the list behind the Project selector both Apps share, and the
 * one the Project pages confirm against. It keeps the remembered Project (TeamContext) valid:
 * once a list is known, a Project that is not in it gives way to the Team's first one, so the
 * selector, the side menu and the Mail landing never point at another Team's Project.
 */
export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const { currentTeam, lastProjectId, rememberProject, forgetProject } = useTeam();
  const { getErrorMessage } = useErrorMessage();
  const teamId = currentTeam?.id ?? null;
  const [loaded, setLoaded] = useState<LoadedProjects | null>(null);
  const [failure, setFailure] = useState<FailedLoad | null>(null);
  // Only the newest read may land, and only while its Team is still the selected one.
  const ticket = useRef(0);
  const selectedTeam = useRef(teamId);

  useEffect(() => {
    selectedTeam.current = teamId;
  }, [teamId]);

  const fetchProjects = useCallback(
    async (forTeam: string): Promise<Project[]> => {
      const mine = ++ticket.current;
      const lands = () => mine === ticket.current && selectedTeam.current === forTeam;
      try {
        const response = await GetProjects(forTeam);
        const items = response.data ?? [];
        if (lands()) {
          setLoaded({ teamId: forTeam, items });
          setFailure(null);
          // Read from storage, not state: a page may have remembered its Project meanwhile.
          const remembered = getLastProjectId();
          if (!items.some((project) => project.id === remembered)) {
            if (items[0]) rememberProject(items[0].id);
            else forgetProject();
          }
        }
        return items;
      } catch (err) {
        if (lands()) setFailure({ teamId: forTeam, message: getErrorMessage(err) });
        throw err;
      }
    },
    [getErrorMessage, rememberProject, forgetProject]
  );

  // Keyed on the Team only: `fetchProjects` changes with the translator, and a language switch
  // must not refetch.
  useEffect(() => {
    if (!teamId) return;
    fetchProjects(teamId).catch(() => {
      // Kept as the context's error; the pages showing the list offer the retry.
    });
  }, [teamId]);

  const reload = useCallback(
    (): Promise<Project[]> => (teamId ? fetchProjects(teamId) : Promise.resolve(NO_PROJECTS)),
    [teamId, fetchProjects]
  );

  const addProject = useCallback(
    (project: Project) => {
      setLoaded((current) =>
        current && current.teamId === project.teamId
          ? {
              teamId: current.teamId,
              items: [project, ...current.items.filter((item) => item.id !== project.id)],
            }
          : current
      );
      rememberProject(project.id);
    },
    [rememberProject]
  );

  const isLoaded = !!teamId && loaded?.teamId === teamId;
  const projects = isLoaded && loaded ? loaded.items : NO_PROJECTS;
  const error = !isLoaded && teamId && failure?.teamId === teamId ? failure.message : null;

  const value: ProjectContextValues = {
    projects,
    currentProject: projects.find((project) => project.id === lastProjectId) ?? null,
    isLoading: !!teamId && !isLoaded && !error,
    error,
    reload,
    addProject,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

export default ProjectContext;
