import type { ReactNode } from "react";

export interface UsageMeterProps {
  label: string;
  /** How much is used of how much, already worded ("1,234 of 10,000"). */
  value: string;
  used: number;
  total: number;
  /** A line under the bar: when it renews or resets. */
  footnote?: ReactNode;
}
