"use client";

import { Input } from "antd";
import { useId } from "react";
import classNames from "classnames";
import NoderaFormField from "@/components/NoderaFormField";
import NoderaInput from "@/components/NoderaInput";
import NoderaInputPassword from "@/components/NoderaInputPassword";
import type { NoderaTextFieldProps } from "./type";

/** Labeled text control: single line, email, password (with eye toggle) or textarea. */
export default function NoderaTextField({
  label,
  value,
  onChange,
  kind = "text",
  hint,
  error,
  required = false,
  rows = 3,
  onEnter,
  className,
  id,
  ...rest
}: NoderaTextFieldProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const hasError = !!error;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && onEnter) {
      event.preventDefault();
      onEnter();
    }
  };

  let control: React.ReactNode;
  if (kind === "password") {
    control = (
      <NoderaInputPassword
        id={controlId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        error={hasError}
        {...rest}
      />
    );
  } else if (kind === "textarea") {
    control = (
      <Input.TextArea
        id={controlId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        status={hasError ? "error" : undefined}
        className="rounded-input"
        placeholder={rest.placeholder}
        disabled={rest.disabled}
        maxLength={rest.maxLength}
        autoFocus={rest.autoFocus}
      />
    );
  } else {
    control = (
      <NoderaInput
        id={controlId}
        type={kind}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        error={hasError}
        {...rest}
      />
    );
  }

  return (
    <NoderaFormField
      label={label}
      htmlFor={controlId}
      hint={hint}
      error={error}
      required={required}
      className={classNames(className)}
    >
      {control}
    </NoderaFormField>
  );
}
