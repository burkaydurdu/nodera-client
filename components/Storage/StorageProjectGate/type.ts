import type { ReactNode } from "react";

export interface StorageProjectGateProps {
  /** The Project of the route, confirmed against the selected Team before any page renders. */
  projectId: string;
  children: ReactNode;
}
