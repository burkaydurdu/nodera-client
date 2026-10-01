"use client";

import { createContext, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { GetTeams } from "@/api/teams";
import { SESSION_REFRESHED_EVENT } from "@/core/session";
import type { Team } from "@/core/team";
import {
  clearLastProjectId,
  clearLastTeamId,
  clearPendingInvitation,
  getLastProjectId,
  getLastTeamId,
  getPendingInvitation,
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

  // A sign-up from an invitation link has no Team id to remember: the Invitation is accepted
  // on verification and the invited Team is recognised here by the name the lookup gave. The
  // entry is spent by this first list either way, so a stale name never steers a later pick.
  const invitedTeam = (list: Team[]): Team | null => {
    const pending = getPendingInvitation();
    if (!pending?.autoAccepted) return null;
    clearPendingInvitation();
    return list.find((team) => team.name === pending.teamName) ?? null;
  };

  const pickTeam = (list: Team[]): string | null => {
    const remembered = getLastTeamId();
    const picked =
      invitedTeam(list) ?? list.find((team) => team.id === remembered) ?? list[0] ?? null;
    if (picked) setLastTeamId(picked.id);
    else clearLastTeamId();
    return picked?.id ?? null;
  };

  const load = useCallback(
    async (silent: boolean) => {
      if (!silent) setIsLoading(true);
      setError(null);
      try {
        const response = await GetTeams();
        const list = response.data ?? [];
        setTeams(list);
        setCurrentTeamId(pickTeam(list));
      } catch (err) {
        if (!silent) setError(getErrorMessage(err));
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    [getErrorMessage]
  );

  const reload = useCallback(() => load(false), [load]);

  // `reload` changes with the translator (locale switch); listing it would refetch the Teams
  // on every language change, so the effect keys on the user only.
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

  // A rotated access token may carry new Roles (ADR-0005): the list is refetched quietly so
  // useCan follows without a hard reload. One refetch per rotation, never while one is in
  // flight, and a failure here is left to the next user action — a reload must not trigger
  // another refresh.
  const silentReload = useRef(false);
  const userId = currentUser?.id ?? null;
  useEffect(() => {
    if (!userId) return;
    const onRefreshed = () => {
      if (silentReload.current) return;
      silentReload.current = true;
      load(true).finally(() => {
        silentReload.current = false;
      });
    };
    window.addEventListener(SESSION_REFRESHED_EVENT, onRefreshed);
    return () => window.removeEventListener(SESSION_REFRESHED_EVENT, onRefreshed);
  }, [userId, load]);

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
      // Upsert: accepting an Invitation to a Team one already belongs to answers the same Team.
      setTeams((list) =>
        list.some((item) => item.id === team.id)
          ? list.map((item) => (item.id === team.id ? team : item))
          : [...list, team]
      );
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
