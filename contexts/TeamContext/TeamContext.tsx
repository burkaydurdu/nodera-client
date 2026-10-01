"use client";

import { createContext, ReactNode, useCallback, useEffect, useState } from "react";
import { GetTeams } from "@/api/teams";
import type { Team } from "@/core/team";
import {
  clearLastProjectId,
  clearLastTeamId,
  getLastProjectId,
  getLastTeamId,
  setLastProjectId,
  setLastTeamId,
} from "@/core/storage";
import useAuth from "../AuthContext/useAuth";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import type { TeamContextValues } from "./Types";

const TeamContext = createContext<TeamContextValues>({
  teams: [],
  currentTeam: null,
  isLoading: true,
  error: null,
  selectTeam: () => {},
  addTeam: () => {},
  reload: () => Promise.resolve(),
  lastProjectId: null,
  rememberProject: () => {},
  forgetProject: () => {},
});

/**
 * Loads the user's Teams once the user is known and keeps the selected one, plus the Project
 * last opened within it, in localStorage. The Project lives here because it is scoped to the
 * Team: switching Team must drop it, and the sidebar reads it from the same source that pages
 * write to.
 */
export const TeamProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useAuth();
  const { getErrorMessage } = useErrorMessage();
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeamId, setCurrentTeamId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Read after mount so server and client render the same markup.
  const [lastProjectId, setLastProjectIdState] = useState<string | null>(null);

  useEffect(() => {
    setLastProjectIdState(getLastProjectId());
  }, []);

  const rememberProject = useCallback((projectId: string) => {
    setLastProjectId(projectId);
    setLastProjectIdState(projectId);
  }, []);

  const forgetProject = useCallback(() => {
    clearLastProjectId();
    setLastProjectIdState(null);
  }, []);

  const pickTeam = (list: Team[]): string | null => {
    const remembered = getLastTeamId();
    const picked = list.find((team) => team.id === remembered) ?? list[0] ?? null;
    if (picked) setLastTeamId(picked.id);
    else clearLastTeamId();
    return picked?.id ?? null;
  };

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await GetTeams();
      const list = response.data ?? [];
      setTeams(list);
      setCurrentTeamId(pickTeam(list));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [getErrorMessage]);

  useEffect(() => {
    if (currentUser) {
      reload();
      return;
    }
    setTeams([]);
    setCurrentTeamId(null);
    setLastProjectIdState(null);
    setIsLoading(!currentUser);
  }, [currentUser?.id]);

  const selectTeam = useCallback(
    (teamId: string) => {
      if (teamId === currentTeamId || !teams.some((team) => team.id === teamId)) return;
      setLastTeamId(teamId);
      // Projects are per Team: the remembered project cannot belong to the new one.
      forgetProject();
      setCurrentTeamId(teamId);
    },
    [currentTeamId, teams, forgetProject]
  );

  const addTeam = useCallback(
    (team: Team) => {
      setTeams((list) => [...list, team]);
      setLastTeamId(team.id);
      forgetProject();
      setCurrentTeamId(team.id);
    },
    [forgetProject]
  );

  const currentTeam = teams.find((team) => team.id === currentTeamId) ?? null;

  const value: TeamContextValues = {
    teams,
    currentTeam,
    isLoading,
    error,
    selectTeam,
    addTeam,
    reload,
    lastProjectId,
    rememberProject,
    forgetProject,
  };

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
};

export default TeamContext;
