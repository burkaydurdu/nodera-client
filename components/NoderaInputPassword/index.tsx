"use client";

import { Input } from "antd";
import classNames from "classnames";
import type { NoderaInputPasswordProps } from "./type";

export default function NoderaInputPassword({
  error = false,
  errorMessage,
  className,
  ...rest
}: NoderaInputPasswordProps) {
  return (
    <div className="flex flex-col gap-1">
      <Input.Password
        className={classNames("rounded-input", className)}
        status={error ? "error" : undefined}
        {...rest}
      />
      {error && errorMessage && (
        <span className="text-xs leading-4 text-danger">{errorMessage}</span>
      )}
    </div>
  );
}
