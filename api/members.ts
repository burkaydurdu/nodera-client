import APIClient from "./client";
import type { Member } from "@/core/member";
import type { TeamRole } from "@/core/user";

export const ListMembers = (teamId: string) =>
  APIClient.get<Member[]>(`/v1/teams/${teamId}/members`);

export const ChangeMemberRole = (teamId: string, userId: string, role: TeamRole) =>
  APIClient.put<Member>(`/v1/teams/${teamId}/members/${userId}/role`, { role });

export const RemoveMember = (teamId: string, userId: string) =>
  APIClient.delete<void>(`/v1/teams/${teamId}/members/${userId}`);

export const LeaveTeam = (teamId: string) =>
  APIClient.post<void>(`/v1/teams/${teamId}/members/leave`);
