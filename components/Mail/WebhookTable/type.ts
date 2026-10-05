import type { Webhook } from "@/core/mail";

export interface WebhookTableProps {
  webhooks: Webhook[];
  /** `mail.write`: enable/disable, edit and delete; the deliveries are open to every reader. */
  canWrite: boolean;
  /** Id of the Webhook whose change is in flight. */
  busyId?: string | null;
  onToggle: (webhook: Webhook, active: boolean) => void;
  onEdit: (webhook: Webhook) => void;
  onDelete: (webhook: Webhook) => void;
  onDeliveries: (webhook: Webhook) => void;
}
