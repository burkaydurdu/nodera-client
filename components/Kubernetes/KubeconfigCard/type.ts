import type { Cluster } from "@/core/kubernetesApp";

export interface KubeconfigCardProps {
  projectId: string;
  cluster: Cluster;
  canWrite: boolean;
}
