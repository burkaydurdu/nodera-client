import APIClient from "./client";
import type { ApiKey, CreateApiKeyPayload, CreatedApiKey } from "@/core/apiKey";

const projectApiKeys = (teamId: string, projectId: string) =>
  `/v1/teams/${teamId}/projects/${projectId}/api-keys`;

/** Active keys only, newest first. */
export const ListApiKeys = (teamId: string, projectId: string) =>
  APIClient.get<ApiKey[]>(projectApiKeys(teamId, projectId));

/** The answer carries the whole key, the only time it is shown. */
export const CreateApiKey = (
  teamId: string,
  projectId: string,
  payload: CreateApiKeyPayload
) => APIClient.post<CreatedApiKey>(projectApiKeys(teamId, projectId), payload);

export const RevokeApiKey = (teamId: string, projectId: string, keyId: string) =>
  APIClient.delete<void>(`${projectApiKeys(teamId, projectId)}/${keyId}`);
