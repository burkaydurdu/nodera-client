import type { ClusterNode, NodePool } from "@/core/kubernetesApp";

export interface NodePoolCardProps {
  pool: NodePool;
  /** The Nodes of this pool, as the Cluster's shell last read them. */
  nodes: ClusterNode[];
  canWrite: boolean;
  /** The Cluster takes no change (deleting, failed). */
  frozen: boolean;
  /** This pool is the Cluster's last one: it may shrink, never go. */
  last: boolean;
  busy: boolean;
  onResize: (pool: NodePool, count: number) => Promise<boolean>;
  onDelete: (pool: NodePool) => void;
}
