import type { TeamRole } from "./user";

export interface Member {
  userId: string;
  fullName: string;
  email: string;
  role: TeamRole;
  joinedAt: string;
}

export interface ChangeMemberRolePayload {
  role: TeamRole;
}
