import type { ReactNode } from "react";
import type { InputProps } from "antd";

export type NoderaTextFieldKind = "text" | "email" | "password" | "textarea";

export interface NoderaTextFieldProps extends Omit<
  InputProps,
  "status" | "type" | "onChange" | "value" | "size"
> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  kind?: NoderaTextFieldKind;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  /** textarea only */
  rows?: number;
  /** Fires on Enter for single-line kinds. */
  onEnter?: () => void;
  className?: string;
}
