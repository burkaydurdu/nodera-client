import type { ButtonProps } from "antd";

export type NoderaButtonSize = "medium" | "small" | "large";
export type NoderaButtonVariant = "filled" | "outlined" | "text" | "danger";

export interface NoderaButtonProps extends Omit<
  ButtonProps,
  "type" | "variant" | "size" | "danger"
> {
  /** medium: 44px, small: 36px, large: 52px. */
  size?: NoderaButtonSize;
  /** filled (primary), outlined (secondary), text (tertiary), danger (destructive). */
  variant?: NoderaButtonVariant;
  /** Stretch to the parent width. */
  fullWidth?: boolean;
  className?: string;
}
