import APIClient from "./client";
import type { CreateDropletPayload, Droplet, DropletActionType } from "@/core/droplet";

export const ListDroplets = (projectId: string) =>
  APIClient.get<Droplet[]>(`/v1/projects/${projectId}/droplets`);

export const CreateDroplet = (projectId: string, payload: CreateDropletPayload) =>
  APIClient.post<Droplet>(`/v1/projects/${projectId}/droplets`, payload);

export const GetDroplet = (dropletId: string) =>
  APIClient.get<Droplet>(`/v1/droplets/${dropletId}`);

export const DropletAction = (dropletId: string, type: DropletActionType) =>
  APIClient.post<Droplet>(`/v1/droplets/${dropletId}/actions`, { type });

export const DeleteDroplet = (dropletId: string) =>
  APIClient.delete<Droplet>(`/v1/droplets/${dropletId}`);
