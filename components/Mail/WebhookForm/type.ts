import type { Webhook } from "@/core/mail";
import type { WebhookCreatedHandler, WebhookUpdatedHandler } from "../type";

export interface WebhookFormProps {
  projectId: string;
  /** The Webhook to edit; null creates one. */
  webhook: Webhook | null;
  onCreated: WebhookCreatedHandler;
  onUpdated: WebhookUpdatedHandler;
  onCancel?: () => void;
  autoFocus?: boolean;
}
