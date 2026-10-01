"use client";

import { Alert } from "antd";
import classNames from "classnames";
import type { NoderaAlertProps } from "./type";

export default function NoderaAlert({
  variant,
  message,
  description,
  className,
}: NoderaAlertProps) {
  return (
    <Alert
      type={variant}
      showIcon
      message={message}
      description={description}
      className={classNames("rounded-input", className)}
    />
  );
}
