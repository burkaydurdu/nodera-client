"use client";

import { useCallback, useEffect, useState } from "react";
import type { Project } from "@/core/project";
import { DASHBOARD_PATH } from "@/core/routes";
import useProjects from "@/contexts/ProjectContext/useProjects";
import useTeam from "@/contexts/TeamContext/useTeam";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { useNavigate } from "@/hooks/Navigation/useNavigate";

export interface ProjectInTeam {
  /** The Project once confirmed to belong to the current Team; null before, or when it does not. */
  project: Project | null;
  /** The Project is not the current Team's; the user is being sent to the fallback page. */
  missing: boolean;
  /** i18n-resolved message when the Team's Project list could not be loaded. */
  error: string | null;
  retry: () => void;
}

/**
 * Confirms that a Project route belongs to the selected Team and remembers it as the Team's
 * last Project. A Team switch (or a URL of another Team's Project) fails the check and
 * redirects to `fallbackPath`, so a Project page never shows or creates under a foreign Team.
 * The list is read through the shared Project context, so the Project selector learns a
 * Project created elsewhere the moment its page opens.
 */
export const useProjectInTeam = (
  projectId: string,
  fallbackPath: string = DASHBOARD_PATH
): ProjectInTeam => {
  const { currentTeam, rememberProject } = useTeam();
  const { reload } = useProjects();
  const { navigate } = useNavigate();
  const { getErrorMessage } = useErrorMessage();

  const [project, setProject] = useState<Project | null>(null);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const teamId = currentTeam?.id ?? null;

  // Remembered at once so the side menu and the selector point here before the check answers.
  useEffect(() => {
    rememberProject(projectId);
  }, [projectId, rememberProject]);

  // `reload` follows the selected Team, which is in the keys; a language switch must not refetch.
  useEffect(() => {
    if (!teamId) return;
    let cancelled = false;
    setError(null);
    reload()
      .then((list) => {
        if (cancelled) return;
        const found = list.find((item) => item.id === projectId) ?? null;
        setProject(found);
        setMissing(!found);
        // A Team switch forgets the remembered Project; one the new Team holds is kept.
        if (found) rememberProject(found.id);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [teamId, projectId, attempt]);

  useEffect(() => {
    if (missing) navigate(fallbackPath, { replace: true });
  }, [missing, navigate]);

  const retry = useCallback(() => setAttempt((count) => count + 1), []);

  return { project, missing, error, retry };
};
