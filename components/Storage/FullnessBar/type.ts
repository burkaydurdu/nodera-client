import type { ReactNode } from "react";

export interface FullnessBarProps {
  usedBytes: number;
  sizeBytes: number;
  /** A line over the bar, left ("Used"); the figure itself is always printed on the right. */
  label?: string;
  /** A line under the bar: when it was measured, how many objects. */
  footnote?: ReactNode;
  /** The compact form a table row holds: the bar and the figure, nothing else. */
  compact?: boolean;
}
