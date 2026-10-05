import type { ReactNode } from "react";

export interface MailProjectGateProps {
  /** The Project of the route, confirmed against the selected Team before any page renders. */
  projectId: string;
  children: ReactNode;
}
