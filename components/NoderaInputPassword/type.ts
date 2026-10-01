import type { PasswordProps } from "antd/es/input/Password";
import type { ReactNode } from "react";

export interface NoderaInputPasswordProps extends Omit<PasswordProps, "status"> {
  error?: boolean;
  errorMessage?: ReactNode;
  className?: string;
}
