import type { ReactNode } from "react";
import type { RangePickerProps } from "antd/es/date-picker";

/** The picked days as the picker hands them over: a start and an end, or nothing. */
export type NoderaDateRange = Parameters<NonNullable<RangePickerProps["onChange"]>>[0];

export interface NoderaDateRangePickerProps {
  label: string;
  value: NoderaDateRange;
  onChange: (value: NoderaDateRange) => void;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  /** Days that cannot be picked. */
  disabledDate?: RangePickerProps["disabledDate"];
  /** Either end may stay empty: from a day on, or up to one. */
  openEnded?: boolean;
  className?: string;
}
