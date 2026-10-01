import type { ReactNode } from "react";

export interface NoderaLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  /** Muted variant for secondary links. */
  muted?: boolean;
}
