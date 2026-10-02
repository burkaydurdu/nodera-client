import type { BillingTabKey } from "@/core/billing";

export interface BillingTabsProps {
  active: BillingTabKey;
  onChange: (tab: BillingTabKey) => void;
}
