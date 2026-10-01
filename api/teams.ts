import APIClient from "./client";
import type { CreateTeamPayload, Team } from "@/core/team";

export const GetTeams = () => APIClient.get<Team[]>("/v1/teams");

export const CreateTeam = (payload: CreateTeamPayload) =>
  APIClient.post<Team>("/v1/teams", payload);
