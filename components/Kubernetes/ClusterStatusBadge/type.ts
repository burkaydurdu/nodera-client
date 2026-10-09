import type { ClusterStatus } from "@/core/kubernetesApp";

export interface ClusterStatusBadgeProps {
  status: ClusterStatus;
  className?: string;
}
