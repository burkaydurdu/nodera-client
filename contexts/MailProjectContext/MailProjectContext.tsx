"use client";

import { createContext, ReactNode, useMemo } from "react";
import type { Project } from "@/core/project";
import type { MailProjectContextValues } from "./Types";

const MailProjectContext = createContext<MailProjectContextValues | null>(null);

/**
 * Hands every Mail page the Project its layout already confirmed, so a page never checks the
 * Project again and never renders without one.
 */
export const MailProjectProvider = ({
  project,
  children,
}: {
  project: Project;
  children: ReactNode;
}) => {
  const value = useMemo<MailProjectContextValues>(() => ({ project }), [project]);
  return <MailProjectContext.Provider value={value}>{children}</MailProjectContext.Provider>;
};

export default MailProjectContext;
