import APIClient from "./client";
import type { CreateSSHKeyPayload, SSHKey } from "@/core/sshKey";

export const ListSSHKeys = (teamId: string) =>
  APIClient.get<SSHKey[]>(`/v1/teams/${teamId}/ssh-keys`);

export const CreateSSHKey = (teamId: string, payload: CreateSSHKeyPayload) =>
  APIClient.post<SSHKey>(`/v1/teams/${teamId}/ssh-keys`, payload);

export const DeleteSSHKey = (teamId: string, keyId: string) =>
  APIClient.delete<void>(`/v1/teams/${teamId}/ssh-keys/${keyId}`);
