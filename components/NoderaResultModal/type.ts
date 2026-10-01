import type { ReactNode } from "react";

export type NoderaResultModalVariant = "success" | "error";

export interface NoderaResultModalProps {
  open: boolean;
  onClose: () => void;
  variant: NoderaResultModalVariant;
  title: string;
  message: ReactNode;
  /** Primary action label; defaults to a close button. */
  actionLabel?: string;
  onAction?: () => void;
}
