"use client";

import { Input } from "antd";
import classNames from "classnames";
import type { NoderaSearchInputProps } from "./type";

/** A search field with its button, searching on Enter and again when cleared. */
export default function NoderaSearchInput({
  value,
  onChange,
  onSearch,
  placeholder,
  label,
  loading = false,
  className,
}: NoderaSearchInputProps) {
  return (
    <Input.Search
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onSearch={(next) => onSearch(next ?? "")}
      placeholder={placeholder}
      aria-label={label}
      loading={loading}
      allowClear
      enterButton
      className={classNames("rounded-input", className)}
    />
  );
}
