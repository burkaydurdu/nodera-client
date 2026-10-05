import type { WebhookDeliveryStatus } from "@/core/mail";

export interface WebhookDeliveryStatusBadgeProps {
  status: WebhookDeliveryStatus;
  className?: string;
}
