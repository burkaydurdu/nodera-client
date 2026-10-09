"use client";

import { createContext, ReactNode, useMemo } from "react";
import type { Project } from "@/core/project";
import type { KubernetesProjectContextValues } from "./Types";

const KubernetesProjectContext = createContext<KubernetesProjectContextValues | null>(null);

/**
 * Hands every Kubernetes page the Project its layout already confirmed, so a page never checks
 * the Project again and never renders without one.
 */
export const KubernetesProjectProvider = ({
  project,
  children,
}: {
  project: Project;
  children: ReactNode;
}) => {
  const value = useMemo<KubernetesProjectContextValues>(() => ({ project }), [project]);
  return (
    <KubernetesProjectContext.Provider value={value}>
      {children}
    </KubernetesProjectContext.Provider>
  );
};

export default KubernetesProjectContext;
