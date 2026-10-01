import type { ReactNode } from "react";

export interface EmptyBoxProps {
  title: string;
  description: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  /** Rendered under the copy, e.g. an inline form. */
  children?: ReactNode;
  className?: string;
}
