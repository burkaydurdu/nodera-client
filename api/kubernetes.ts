import APIClient from "./client";
import type {
  Cluster,
  ClusterNode,
  Kubeconfig,
  KubernetesRegion,
  KubernetesVersion,
  NodePlan,
  NodePoolInput,
  OpenClusterPayload,
  RenameClusterPayload,
  ResizeNodePoolPayload,
} from "@/core/kubernetesApp";

const projectClusters = (projectId: string) => `/v1/projects/${projectId}/clusters`;
const oneCluster = (projectId: string, clusterId: string) =>
  `${projectClusters(projectId)}/${clusterId}`;

/** Newest first. */
export const ListKubernetesVersions = () =>
  APIClient.get<KubernetesVersion[]>("/v1/kubernetes/versions");

export const ListKubernetesRegions = () =>
  APIClient.get<KubernetesRegion[]>("/v1/kubernetes/regions");

/** The Plans a Node may have in a Region, cheapest first; sold-out ones stay listed and flagged. */
export const ListNodePlans = (region: string) =>
  APIClient.get<NodePlan[]>(`/v1/kubernetes/regions/${region}/plans`);

export const ListClusters = (projectId: string) =>
  APIClient.get<Cluster[]>(projectClusters(projectId));

/** Answers the provisioning Cluster; its Control plane and Nodes follow and arrive through detail. */
export const OpenCluster = (projectId: string, payload: OpenClusterPayload) =>
  APIClient.post<Cluster>(projectClusters(projectId), payload);

export const GetCluster = (projectId: string, clusterId: string) =>
  APIClient.get<Cluster>(oneCluster(projectId, clusterId));

export const RenameCluster = (
  projectId: string,
  clusterId: string,
  payload: RenameClusterPayload
) => APIClient.put<Cluster>(`${oneCluster(projectId, clusterId)}/name`, payload);

export const DeleteCluster = (projectId: string, clusterId: string) =>
  APIClient.delete<Cluster>(oneCluster(projectId, clusterId));

/** A client certificate cut for the caller, good for seven days; nothing is kept. */
export const GetKubeconfig = (projectId: string, clusterId: string) =>
  APIClient.get<Kubeconfig>(`${oneCluster(projectId, clusterId)}/kubeconfig`);

export const ListClusterNodes = (projectId: string, clusterId: string) =>
  APIClient.get<ClusterNode[]>(`${oneCluster(projectId, clusterId)}/nodes`);

export const AddNodePool = (projectId: string, clusterId: string, payload: NodePoolInput) =>
  APIClient.post<Cluster>(`${oneCluster(projectId, clusterId)}/node-pools`, payload);

/** More Nodes are asked for; fewer releases the newest. */
export const ResizeNodePool = (
  projectId: string,
  clusterId: string,
  poolId: string,
  payload: ResizeNodePoolPayload
) =>
  APIClient.put<Cluster>(
    `${oneCluster(projectId, clusterId)}/node-pools/${poolId}/count`,
    payload
  );

export const DeleteNodePool = (projectId: string, clusterId: string, poolId: string) =>
  APIClient.delete<Cluster>(`${oneCluster(projectId, clusterId)}/node-pools/${poolId}`);
