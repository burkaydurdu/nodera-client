"use client";

import { Button } from "antd";
import classNames from "classnames";
import type { NoderaButtonProps } from "./type";

const sizeMap = { small: "small", medium: "middle", large: "large" } as const;

const variantClasses: Record<NonNullable<NoderaButtonProps["variant"]>, string> = {
  filled: "font-semibold",
  outlined:
    "font-semibold border-border text-text hover:border-brand-400! hover:text-brand-700!",
  text: "font-semibold text-brand-600 hover:text-brand-700! hover:bg-brand-50!",
  danger: "font-semibold",
};

export default function NoderaButton({
  size = "medium",
  variant = "filled",
  fullWidth = false,
  className,
  ...rest
}: NoderaButtonProps) {
  const antdType =
    variant === "filled" || variant === "danger"
      ? "primary"
      : variant === "outlined"
        ? "default"
        : "text";

  return (
    <Button
      type={antdType}
      danger={variant === "danger"}
      size={sizeMap[size]}
      block={fullWidth}
      className={classNames("rounded-button shadow-none", variantClasses[variant], className)}
      {...rest}
    />
  );
}
