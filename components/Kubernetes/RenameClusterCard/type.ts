import type { Cluster } from "@/core/kubernetesApp";

export interface RenameClusterCardProps {
  projectId: string;
  cluster: Cluster;
  disabled: boolean;
  onRenamed: (cluster: Cluster) => void;
}
