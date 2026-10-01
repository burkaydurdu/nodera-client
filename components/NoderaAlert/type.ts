import type { ReactNode } from "react";

export type NoderaAlertVariant = "error" | "success" | "info" | "warning";

export interface NoderaAlertProps {
  variant: NoderaAlertVariant;
  message: ReactNode;
  description?: ReactNode;
  className?: string;
}
