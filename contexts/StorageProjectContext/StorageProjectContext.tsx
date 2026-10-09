"use client";

import { createContext, ReactNode, useMemo } from "react";
import type { Project } from "@/core/project";
import type { StorageProjectContextValues } from "./Types";

const StorageProjectContext = createContext<StorageProjectContextValues | null>(null);

/**
 * Hands every Storage page the Project its layout already confirmed, so a page never checks
 * the Project again and never renders without one.
 */
export const StorageProjectProvider = ({
  project,
  children,
}: {
  project: Project;
  children: ReactNode;
}) => {
  const value = useMemo<StorageProjectContextValues>(() => ({ project }), [project]);
  return (
    <StorageProjectContext.Provider value={value}>{children}</StorageProjectContext.Provider>
  );
};

export default StorageProjectContext;
