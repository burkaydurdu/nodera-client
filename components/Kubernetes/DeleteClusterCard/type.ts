import type { Cluster } from "@/core/kubernetesApp";

export interface DeleteClusterCardProps {
  cluster: Cluster;
  deleting: boolean;
  onDelete: () => void;
}
