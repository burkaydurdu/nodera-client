import type { InputProps } from "antd";
import type { ReactNode } from "react";

export interface NoderaInputProps extends Omit<InputProps, "status"> {
  /** Error state — red outline and the message below. */
  error?: boolean;
  errorMessage?: ReactNode;
  className?: string;
}
