import type { Webhook } from "@/core/mail";
import type { WebhookCreatedHandler, WebhookUpdatedHandler } from "../type";

export interface WebhookFormModalProps {
  open: boolean;
  projectId: string;
  /** The Webhook to edit; null creates one. */
  webhook: Webhook | null;
  onClose: () => void;
  onCreated: WebhookCreatedHandler;
  onUpdated: WebhookUpdatedHandler;
}
