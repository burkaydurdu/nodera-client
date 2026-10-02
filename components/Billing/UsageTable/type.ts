import type { UsageLine } from "@/core/billing";

export interface UsageTableProps {
  lines: UsageLine[];
  currency: string;
  loading?: boolean;
}
