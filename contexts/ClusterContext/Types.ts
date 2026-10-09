import type { SetStateAction } from "react";
import type { Cluster, ClusterNode } from "@/core/kubernetesApp";

export interface ClusterContextValues {
  /** The Cluster the pages under it show, as last read or as the service answered a change. */
  cluster: Cluster;
  /** Its Nodes, oldest first, as last read. */
  nodes: ClusterNode[];
  /** Reads the Cluster and its Nodes again quietly: after a push, or a change made on a page. */
  refresh: () => void;
  /** Shows what the service answered to a change. */
  setCluster: (update: SetStateAction<Cluster | null>) => void;
}
