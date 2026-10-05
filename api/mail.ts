import APIClient from "./client";
import type {
  ChooseMailPackagePayload,
  CreateSendingDomainPayload,
  CreateWebhookPayload,
  CreatedWebhook,
  ListMessagesQuery,
  ListSuppressionsQuery,
  MailOverview,
  MailPackage,
  MessageDetail,
  MessageSummary,
  SendingDomain,
  Suppression,
  UpdateWebhookPayload,
  Webhook,
  WebhookDelivery,
} from "@/core/mail";
import type { CursorPage, CursorQuery } from "@/core/paging";

const projectMail = (projectId: string) => `/v1/projects/${projectId}/mail`;

export const ListMailPackages = () => APIClient.get<MailPackage[]>("/v1/mail/packages");

export const GetMailOverview = (projectId: string) =>
  APIClient.get<MailOverview>(projectMail(projectId));

/** Choose, change or cancel (`none`); the answer is the overview after the change. */
export const ChooseMailPackage = (projectId: string, payload: ChooseMailPackagePayload) =>
  APIClient.put<MailOverview>(`${projectMail(projectId)}/package`, payload);

export const ListSendingDomains = (projectId: string) =>
  APIClient.get<SendingDomain[]>(`${projectMail(projectId)}/domains`);

export const CreateSendingDomain = (projectId: string, payload: CreateSendingDomainPayload) =>
  APIClient.post<SendingDomain>(`${projectMail(projectId)}/domains`, payload);

export const GetSendingDomain = (projectId: string, domainId: string) =>
  APIClient.get<SendingDomain>(`${projectMail(projectId)}/domains/${domainId}`);

export const DeleteSendingDomain = (projectId: string, domainId: string) =>
  APIClient.delete<void>(`${projectMail(projectId)}/domains/${domainId}`);

/** Checks the records at once; the service allows this once a minute per domain (429). */
export const VerifySendingDomain = (projectId: string, domainId: string) =>
  APIClient.post<SendingDomain>(`${projectMail(projectId)}/domains/${domainId}/verify`);

export const ListMessages = (projectId: string, query: ListMessagesQuery = {}) =>
  APIClient.get<CursorPage<MessageSummary>>(`${projectMail(projectId)}/messages`, {
    params: query,
  });

export const GetMessage = (projectId: string, messageId: string) =>
  APIClient.get<MessageDetail>(`${projectMail(projectId)}/messages/${messageId}`);

export const ListSuppressions = (projectId: string, query: ListSuppressionsQuery = {}) =>
  APIClient.get<CursorPage<Suppression>>(`${projectMail(projectId)}/suppressions`, {
    params: query,
  });

/** Bounce Suppressions only; a complaint one answers 409. */
export const DeleteSuppression = (projectId: string, suppressionId: string) =>
  APIClient.delete<void>(`${projectMail(projectId)}/suppressions/${suppressionId}`);

export const ListWebhooks = (projectId: string) =>
  APIClient.get<Webhook[]>(`${projectMail(projectId)}/webhooks`);

/** The answer carries the signing secret, the only time it is shown. */
export const CreateWebhook = (projectId: string, payload: CreateWebhookPayload) =>
  APIClient.post<CreatedWebhook>(`${projectMail(projectId)}/webhooks`, payload);

export const UpdateWebhook = (
  projectId: string,
  webhookId: string,
  payload: UpdateWebhookPayload
) => APIClient.put<Webhook>(`${projectMail(projectId)}/webhooks/${webhookId}`, payload);

export const DeleteWebhook = (projectId: string, webhookId: string) =>
  APIClient.delete<void>(`${projectMail(projectId)}/webhooks/${webhookId}`);

export const ListWebhookDeliveries = (
  projectId: string,
  webhookId: string,
  query: CursorQuery = {}
) =>
  APIClient.get<CursorPage<WebhookDelivery>>(
    `${projectMail(projectId)}/webhooks/${webhookId}/deliveries`,
    { params: query }
  );
