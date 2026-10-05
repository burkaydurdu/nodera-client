import type { BillingStatusValue } from "./billing";
import type { DropletStatus } from "./droplet";
import type { SendingDomainStatus } from "./mail";
import type { Notification } from "./notification";

/** A Droplet moved; a page showing it, or its Project's list, refetches. */
export interface DropletStatusChanged {
  teamId: string;
  dropletId: string;
  projectId: string;
  status: DropletStatus;
}

/** A Team's Billing status moved; the banner and the create gate refetch. */
export interface BillingStatusChanged {
  teamId: string;
  status: BillingStatusValue;
}

/** A Sending domain was verified or lost; its Project's domain views refetch. */
export interface MailDomainChanged {
  projectId: string;
  sendingDomainId: string;
  status: SendingDomainStatus;
}

/** What a Project may send moved (Package, limits, Pause); its Mail overview refetches. */
export interface MailSendingChanged {
  projectId: string;
}

/** Reads made in one of the user's tabs: the listed Notifications, or every one. */
export interface NotificationsRead {
  notificationIds?: string[];
  all?: boolean;
}

/** The pushed message types the web app acts on, with their (camelized) data. */
export interface RealtimeMessages {
  "notification.created": Notification;
  "notification.read": NotificationsRead;
  "droplet.status_changed": DropletStatusChanged;
  "billing.status_changed": BillingStatusChanged;
  "mail.domain_changed": MailDomainChanged;
  "mail.sending_changed": MailSendingChanged;
}

export type RealtimeMessageType = keyof RealtimeMessages;

/** `at` is when the server sent the message. */
export type RealtimeHandler<T extends RealtimeMessageType> = (
  data: RealtimeMessages[T],
  at: string
) => void;

/** A frame as the server sends it; types this build does not know are dropped unread. */
export interface RealtimeEnvelope {
  type: string;
  data?: unknown;
  at?: string;
}
