import type { InvoiceStatus } from "@/core/billing";

export interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
  className?: string;
}
