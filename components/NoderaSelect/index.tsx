"use client";

import { Select } from "antd";
import { useId } from "react";
import NoderaFormField from "@/components/NoderaFormField";
import type { NoderaSelectProps } from "./type";

export default function NoderaSelect<V extends string = string>({
  label,
  value,
  onChange,
  options,
  placeholder,
  hint,
  error,
  required = false,
  disabled = false,
  searchable = true,
  className,
}: NoderaSelectProps<V>) {
  const id = useId();

  return (
    <NoderaFormField
      label={label}
      htmlFor={id}
      hint={hint}
      error={error}
      required={required}
      className={className}
    >
      <Select<V>
        id={id}
        value={value}
        onChange={onChange}
        options={options}
        placeholder={placeholder}
        disabled={disabled}
        showSearch={searchable}
        optionFilterProp="label"
        status={error ? "error" : undefined}
        className="w-full"
      />
    </NoderaFormField>
  );
}
