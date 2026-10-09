import type { StorageUsageDay } from "@/core/storageApp";

export interface UsageTrafficTableProps {
  /** Newest first. */
  days: StorageUsageDay[];
}
