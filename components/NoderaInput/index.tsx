"use client";

import { Input } from "antd";
import classNames from "classnames";
import type { NoderaInputProps } from "./type";

export default function NoderaInput({
  error = false,
  errorMessage,
  className,
  ...rest
}: NoderaInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <Input
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
