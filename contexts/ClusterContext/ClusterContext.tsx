"use client";

import { createContext, ReactNode, type SetStateAction, useMemo } from "react";
import type { Cluster, ClusterNode } from "@/core/kubernetesApp";
import type { ClusterContextValues } from "./Types";

const ClusterContext = createContext<ClusterContextValues | null>(null);

/**
 * Hands the pages of one Cluster (Overview, Settings) the Cluster and its Nodes the shell read,
 * with the banners and tabs already drawn, so a page never reads them a second time.
 */
export const ClusterProvider = ({
  cluster,
  nodes,
  refresh,
  setCluster,
  children,
}: {
  cluster: Cluster;
  nodes: ClusterNode[];
  refresh: () => void;
  setCluster: (update: SetStateAction<Cluster | null>) => void;
  children: ReactNode;
}) => {
  const value = useMemo<ClusterContextValues>(
    () => ({ cluster, nodes, refresh, setCluster }),
    [cluster, nodes, refresh, setCluster]
  );
  return <ClusterContext.Provider value={value}>{children}</ClusterContext.Provider>;
};

export default ClusterContext;
