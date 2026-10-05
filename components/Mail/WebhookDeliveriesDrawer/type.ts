import type { Webhook } from "@/core/mail";

export interface WebhookDeliveriesDrawerProps {
  projectId: string;
  /** The Webhook whose deliveries are shown; null closes the drawer. */
  webhook: Webhook | null;
  onClose: () => void;
}
