import type { ReactNode } from "react";

export interface NoderaFormFieldProps {
  label: string;
  /** id of the control the label points to. */
  htmlFor?: string;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  children: ReactNode;
  className?: string;
}
