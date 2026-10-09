import type {
  Cluster,
  KubernetesRegion,
  KubernetesVersion,
  NodePlan,
} from "@/core/kubernetesApp";

export interface OpenClusterFormProps {
  projectId: string;
  regions: KubernetesRegion[];
  /** Newest first. */
  versions: KubernetesVersion[];
  /** The Plans a Node may have in the chosen Region, cheapest first. */
  plans: NodePlan[];
  onOpened: (cluster: Cluster) => void;
  onCancel: () => void;
}
