import type { TeamRole } from "./user";

export interface Team {
  id: string;
  name: string;
  role: TeamRole;
  createdAt: string;
}

export interface CreateTeamPayload {
  name: string;
}

export const TEAM_NAME_MIN_LENGTH = 1;
export const TEAM_NAME_MAX_LENGTH = 100;
