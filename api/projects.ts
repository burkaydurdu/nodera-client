import APIClient from "./client";
import type { CreateProjectPayload, Project } from "@/core/project";

export const GetProjects = (teamId: string) =>
  APIClient.get<Project[]>(`/v1/teams/${teamId}/projects`);

export const CreateProject = (teamId: string, payload: CreateProjectPayload) =>
  APIClient.post<Project>(`/v1/teams/${teamId}/projects`, payload);
