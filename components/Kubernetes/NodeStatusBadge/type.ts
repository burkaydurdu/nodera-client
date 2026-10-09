import type { NodeStatus } from "@/core/kubernetesApp";

export interface NodeStatusBadgeProps {
  status: NodeStatus;
  className?: string;
}
