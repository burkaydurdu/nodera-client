import type { PaymentStatus } from "@/core/billing";

export interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  className?: string;
}
