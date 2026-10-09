import type { Cluster } from "@/core/kubernetesApp";

export type ClusterHandler = (cluster: Cluster) => void;
