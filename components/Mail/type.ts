import type { CreatedWebhook, SendingDomain, Webhook } from "@/core/mail";

/** Shared by the Mail feature components. */
export interface SendingDomainCreatedHandler {
  (domain: SendingDomain): void;
}

export interface WebhookCreatedHandler {
  (webhook: CreatedWebhook): void;
}

export interface WebhookUpdatedHandler {
  (webhook: Webhook): void;
}
