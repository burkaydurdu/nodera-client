"use client";

import { useCallback, useEffect, useState } from "react";
import { GetProjects } from "@/api/projects";
import type { Project } from "@/core/project";
import useTeam from "@/contexts/TeamContext/useTeam";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { useNavigate } from "@/hooks/Navigation/useNavigate";

export interface ProjectInTeam {
  /** The Project once confirmed to belong to the current Team; null before, or when it does not. */
  project: Project | null;
  /** The Project is not the current Team's; the user is being sent back to the dashboard. */
  missing: boolean;
  /** i18n-resolved message when the Team's Project list could not be loaded. */
  error: string | null;
  retry: () => void;
}

/**
 * Confirms that a Project route belongs to the selected Team and remembers it as the Team's
 * last Project. A Team switch (or a URL of another Team's Project) fails the check and
 * redirects, so a Project page never shows or creates under a foreign Team.
 */
export const useProjectInTeam = (projectId: string): ProjectInTeam => {
  const { currentTeam, rememberProject, forgetProject } = useTeam();
  const { navigate } = useNavigate();
  const { getErrorMessage } = useErrorMessage();

  const [project, setProject] = useState<Project | null>(null);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const teamId = currentTeam?.id ?? null;

  // Remembered at once so the sidebar's Droplets entry points here before the check answers.
  useEffect(() => {
    rememberProject(projectId);
  }, [projectId, rememberProject]);

  useEffect(() => {
    if (!teamId) return;
    let cancelled = false;
    setError(null);
    GetProjects(teamId)
      .then((response) => {
        if (cancelled) return;
        const found = (response.data ?? []).find((item) => item.id === projectId) ?? null;
        setProject(found);
        setMissing(!found);
        if (!found) forgetProject();
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [teamId, projectId, attempt, getErrorMessage, forgetProject]);

  useEffect(() => {
    if (missing) navigate("/dashboard", { replace: true });
  }, [missing, navigate]);

  const retry = useCallback(() => setAttempt((count) => count + 1), []);

  return { project, missing, error, retry };
};
