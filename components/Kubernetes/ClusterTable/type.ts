import type { Cluster } from "@/core/kubernetesApp";
import type { ClusterHandler } from "../type";

export interface ClusterTableProps {
  clusters: Cluster[];
  onOpen: ClusterHandler;
}
