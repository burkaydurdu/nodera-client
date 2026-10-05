"use client";

import { useId } from "react";
import { DatePicker } from "antd";
import NoderaFormField from "@/components/NoderaFormField";
import type { NoderaDateRangePickerProps } from "./type";

/** Labeled range of days, shaped like the other Nodera inputs. */
export default function NoderaDateRangePicker({
  label,
  value,
  onChange,
  hint,
  error,
  required = false,
  disabled = false,
  disabledDate,
  openEnded = false,
  className,
}: NoderaDateRangePickerProps) {
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
      <DatePicker.RangePicker
        id={id}
        value={value}
        onChange={(range) => onChange(range)}
        disabledDate={disabledDate}
        allowEmpty={openEnded}
        disabled={disabled}
        status={error ? "error" : undefined}
        className="w-full rounded-input"
      />
    </NoderaFormField>
  );
}
