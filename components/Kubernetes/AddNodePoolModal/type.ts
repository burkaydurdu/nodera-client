import type { Cluster, NodePlan } from "@/core/kubernetesApp";

export interface AddNodePoolModalProps {
  open: boolean;
  projectId: string;
  cluster: Cluster;
  /** The Plans a Node may have in the Cluster's Region, cheapest first. */
  plans: NodePlan[];
  onClose: () => void;
  /** The Cluster as the service answered it, the new pool among its pools. */
  onAdded: (cluster: Cluster) => void;
}
