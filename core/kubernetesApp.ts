/**
 * Kubernetes types as the kubernetes service's management API declares them (snake_case on
 * the wire): a Cluster whose Control plane Nodera runs and whose Nodes are the Project's own
 * Droplets.
 */
import type { BillingStatusValue } from "./billing";
import { projectPath } from "./project";

export interface KubernetesVersion {
  version: string;
}

/** One Region Kubernetes is sold in; the launch Region is `vno1`. */
export interface KubernetesRegion {
  code: string;
  city: string;
  country: string;
}

/** A Plan a Node may have, as the droplet catalog last announced it. */
export interface NodePlan {
  code: string;
  regionCode: string;
  cpuCount: number;
  ramGb: number;
  /** USD per hour excluding taxes, four decimals. */
  hourlyPrice: string;
  /** USD per month excluding taxes, two decimals. */
  monthlyPrice: string;
  soldOut: boolean;
}

export const TAINT_EFFECTS = ["NoSchedule", "PreferNoSchedule", "NoExecute"] as const;
export type TaintEffect = (typeof TAINT_EFFECTS)[number];

export interface Taint {
  key: string;
  value: string;
  effect: TaintEffect;
}

/** A Node pool carries its count as asked for; the Nodes say what exists. */
export interface NodePool {
  id: string;
  name: string;
  planCode: string;
  count: number;
  labels: Record<string, string>;
  taints: Taint[];
  createdAt: string;
}

export type ClusterStatus = "provisioning" | "running" | "degraded" | "deleting" | "failed";

export type NodeStatus =
  "requested" | "joining" | "ready" | "not_ready" | "releasing" | "failed";

/** Why a Cluster or a Node failed, as a code the web app words in the user's language. */
export const KUBERNETES_FAILURE_CODES = [
  "control_plane_failed",
  "node_rejected",
  "timed_out",
] as const;
export type KubernetesFailureCode = (typeof KUBERNETES_FAILURE_CODES)[number];

export const isKubernetesFailureCode = (
  value: string | null | undefined
): value is KubernetesFailureCode =>
  !!value && (KUBERNETES_FAILURE_CODES as readonly string[]).includes(value);

export interface Cluster {
  id: string;
  projectId: string;
  /** An RFC 1123 label, unique in the Project; may be changed. */
  name: string;
  region: string;
  version: string;
  status: ClusterStatus;
  /** host:port the API server answers at, the port the Cluster's own; fixed for its life. */
  endpoint: string;
  /** The Team's Billing status as Kubernetes last learned it. */
  billingStatus: BillingStatusValue;
  failureCode: string | null;
  /** The service's English sentence: shown only for a failure it never coded. */
  failureReason: string | null;
  nodePools: NodePool[];
  createdAt: string;
  deletedAt: string | null;
}

/** One member of a Node pool; `dropletId` names it in the Project's Droplet list once opened. */
export interface ClusterNode {
  id: string;
  poolId: string;
  hostname: string;
  status: NodeStatus;
  dropletId: string | null;
  dropletStatus: string;
  ipv4: string | null;
  failureCode: string | null;
  failureReason: string | null;
  createdAt: string;
  readyAt: string | null;
}

/** The file itself and when the certificate in it stops working. */
export interface Kubeconfig {
  kubeconfig: string;
  expiresAt: string;
}

export interface NodePoolInput {
  name: string;
  plan: string;
  count: number;
  labels?: Record<string, string>;
  taints?: Taint[];
}

export interface OpenClusterPayload {
  name: string;
  region: string;
  version: string;
  nodePool: NodePoolInput;
}

export interface RenameClusterPayload {
  name: string;
}

export interface ResizeNodePoolPayload {
  count: number;
}

/** The limits the service enforces by default; a refusal is still told from its code. */
export const MAX_CLUSTERS_PER_PROJECT = 5;
export const MAX_POOLS_PER_CLUSTER = 5;
export const MAX_NODES_PER_POOL = 20;
export const MIN_NODES_PER_POOL = 1;
export const CLUSTER_NAME_MAX_LENGTH = 63;
export const POOL_NAME_MAX_LENGTH = 32;
/** A Node needs at least this much; smaller Plans are not listed. */
export const MIN_NODE_CPUS = 2;
export const MIN_NODE_RAM_GB = 4;
/** How long a Kubeconfig is good for. */
export const KUBECONFIG_DAYS = 7;

export type KubernetesNameIssue = "required" | "tooLong" | "charset" | "edge";

const LABEL_PATTERN = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

/** RFC 1123 label, as the service checks a Cluster's or a pool's name. */
export function validateKubernetesName(
  value: string,
  maxLength: number
): KubernetesNameIssue | null {
  if (value.length === 0) return "required";
  if (value.length > maxLength) return "tooLong";
  if (/[^a-z0-9-]/.test(value)) return "charset";
  if (value.startsWith("-") || value.endsWith("-")) return "edge";
  return LABEL_PATTERN.test(value) ? null : "charset";
}

export const normalizeKubernetesName = (value: string): string => value.trim().toLowerCase();

/** A Cluster on its way out or failed takes no change; it can only be deleted. */
export const isClusterAlive = (cluster: Cluster): boolean =>
  cluster.status === "provisioning" ||
  cluster.status === "running" ||
  cluster.status === "degraded";

export const isClusterDeleting = (cluster: Cluster): boolean => cluster.status === "deleting";

/** The Control plane answers once the Cluster has run or is degraded; a Kubeconfig needs that. */
export const hasControlPlane = (cluster: Cluster): boolean =>
  cluster.status === "running" || cluster.status === "degraded";

/** Statuses the jobs may still move; a fallback poll runs while a Cluster is in one. */
export const isClusterTransitional = (cluster: Cluster): boolean =>
  cluster.status === "provisioning" || cluster.status === "deleting";

/** What keeps a change from being charged: no card yet, or an unpaid invoice. */
export type KubernetesBillingBlock = Exclude<BillingStatusValue, "active">;

export const kubernetesBillingBlock = (cluster: Cluster): KubernetesBillingBlock | null =>
  cluster.billingStatus === "active" ? null : cluster.billingStatus;

/** The Nodes of one pool that still fill a place of its count. */
export const countingNodes = (nodes: readonly ClusterNode[], poolId: string): ClusterNode[] =>
  nodes.filter(
    (node) =>
      node.poolId === poolId &&
      (node.status === "requested" ||
        node.status === "joining" ||
        node.status === "ready" ||
        node.status === "not_ready")
  );

/**
 * Poll interval while a Cluster is transitional. A change is pushed over the realtime socket;
 * this only covers a push that never arrived.
 */
export const CLUSTER_FALLBACK_POLL_INTERVAL_MS = 30_000;

/** The Kubernetes App's entry route; a Cluster notification links here with `?project=&cluster=`. */
export const KUBERNETES_LANDING_PATH = "/dashboard/kubernetes";
export const KUBERNETES_TEAM_PARAM = "team";
export const KUBERNETES_PROJECT_PARAM = "project";
export const KUBERNETES_CLUSTER_PARAM = "cluster";

/** A Project's Clusters. */
export const clustersPath = (projectId: string): string =>
  `${projectPath(projectId)}/kubernetes`;

export const newClusterPath = (projectId: string): string => `${clustersPath(projectId)}/new`;

export const CLUSTER_SECTIONS = ["settings"] as const;
export type ClusterSection = (typeof CLUSTER_SECTIONS)[number];

/** One Cluster's pages: its Nodes and pools at the root, then a section. */
export const clusterPath = (
  projectId: string,
  clusterId: string,
  section?: ClusterSection
): string => `${clustersPath(projectId)}/${clusterId}${section ? `/${section}` : ""}`;

/** The Cluster a page is about, read from its path; null for the list and the open form. */
export function clusterOfPath(pathname: string, projectId: string): string | null {
  const base = `${clustersPath(projectId)}/`;
  if (!pathname.startsWith(base)) return null;
  const clusterId = pathname.slice(base.length).split("/")[0];
  return clusterId && clusterId !== "new" ? clusterId : null;
}

/** The file name a downloaded Kubeconfig gets. */
export const kubeconfigFileName = (cluster: Cluster): string =>
  `${cluster.name}-kubeconfig.yaml`;
