import type { ClusterNode } from "@/core/kubernetesApp";

export interface NodeTableProps {
  nodes: ClusterNode[];
}
