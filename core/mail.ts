/** Mail types as the mail service's management API declares them (snake_case on the wire). */
import type { BillingStatusValue } from "./billing";
import type { CursorQuery } from "./paging";
import { projectPath } from "./project";

/** One Package of the catalog; `GET /v1/mail/packages` lists them smallest first. */
export interface MailPackage {
  code: string;
  monthlyEmails: number;
  /** USD per month excluding taxes, two decimals ("9.00"). */
  monthlyPrice: string;
}

/** The Project's Package: the catalog entry copied, price included, when it was chosen. */
export interface ProjectMailPackage extends MailPackage {
  startedAt: string;
}

/** The code `PUT …/mail/package` takes for a cancellation, and a scheduled change names. */
export const NO_PACKAGE = "none";

/** A downgrade or a cancellation waiting for the next Period. */
export interface ScheduledPackageChange {
  /** The Package the next Period starts with, or `none` when Mail stops. */
  code: string;
  effectiveAt: string;
}

/** The calendar month (UTC) the allowance is counted in. */
export interface MailPeriod {
  start: string;
  /** Exclusive: the first instant of the next Period, when the allowance renews. */
  end: string;
  allowance: number;
  used: number;
}

export interface MailDailyLimit {
  limit: number;
  used: number;
  resetsAt: string;
}

export interface MailRates {
  windowDays: number;
  sent: number;
  /** Percentages as two-decimal strings: "2.40" is 2.40%. */
  bounceRate: string;
  complaintRate: string;
}

export type PauseReason = "bounce_rate" | "complaint_rate";

export interface MailPause {
  reason: PauseReason;
  pausedAt: string;
}

/** Why sending is or is not possible right now, the first refusal that applies. */
export type SendingState =
  "active" | "no_package" | "exhausted" | "daily_limit" | "paused" | "suspended";

export interface MailOverview {
  projectId: string;
  /** The Team's Billing status as Mail last learned it. */
  billingStatus: BillingStatusValue;
  package: ProjectMailPackage | null;
  scheduledChange: ScheduledPackageChange | null;
  period: MailPeriod | null;
  dailyLimit: MailDailyLimit;
  rates: MailRates;
  pause: MailPause | null;
  sendingState: SendingState;
}

export interface ChooseMailPackagePayload {
  /** A catalog code, or `none` to cancel. */
  code: string;
}

export type SendingDomainStatus = "pending" | "verified" | "unverified";

export type DnsRecordPurpose = "return_path" | "dkim";

/** One CNAME the Team adds; its last check result is kept for the screen. */
export interface DnsRecord {
  purpose: DnsRecordPurpose;
  type: string;
  host: string;
  value: string;
  valid: boolean;
  checkedAt: string | null;
}

export interface SendingDomain {
  id: string;
  name: string;
  status: SendingDomainStatus;
  /** Its absence is a warning, never a refusal; false until the first check looked. */
  dmarcFound: boolean;
  records: DnsRecord[];
  verifiedAt: string | null;
  lastCheckedAt: string | null;
  createdAt: string;
}

/** A domain not checked yet has had no DMARC lookup either, so nothing is missing so far. */
export const isDmarcMissing = (domain: SendingDomain): boolean =>
  !!domain.lastCheckedAt && !domain.dmarcFound;

export interface CreateSendingDomainPayload {
  name: string;
}

/** How a typed domain is sent: the service normalizes further (IDNA) and has the last word. */
export const normalizeDomainName = (value: string): string =>
  value.trim().toLowerCase().replace(/\.+$/, "");

export type DomainNameIssue = "required" | "tooLong" | "format";

/**
 * A light check before the request: a bare domain with at least two labels, no scheme, path,
 * address or port. Internationalized names pass; the service validates labels itself.
 */
export function validateDomainName(value: string): DomainNameIssue | null {
  const name = normalizeDomainName(value);
  if (!name) return "required";
  if (name.length > SENDING_DOMAIN_MAX_LENGTH) return "tooLong";
  if (/[\s/:@]/.test(name) || !name.includes(".") || name.startsWith(".")) return "format";
  if (name.split(".").some((label) => !label)) return "format";
  return null;
}

/** What can happen to one recipient of a Message; what the logs show and Webhooks carry. */
export const MESSAGE_EVENT_TYPES = [
  "accepted",
  "delivered",
  "deferred",
  "bounced",
  "suppressed",
  "complained",
] as const;
export type MessageEventType = (typeof MESSAGE_EVENT_TYPES)[number];

export const isMessageEventType = (
  value: string | null | undefined
): value is MessageEventType =>
  !!value && (MESSAGE_EVENT_TYPES as readonly string[]).includes(value);

/**
 * How far a recipient's Message got: the furthest Message event it reached, so a late deferral
 * never undoes a delivery. The logs show and filter by it.
 */
export type RecipientStatus = MessageEventType;

export type MessageSource = "api" | "smtp";

export interface MessageRecipientSummary {
  address: string;
  status: RecipientStatus;
}

/** A Message as the logs list it. */
export interface MessageSummary {
  id: string;
  from: string;
  subject: string;
  recipients: MessageRecipientSummary[];
  tags: string[];
  source: MessageSource;
  createdAt: string;
}

/** The receiving server's answer to an attempt. */
export interface SmtpResponse {
  code: number | null;
  enhancedCode: string | null;
  text: string | null;
}

export interface MessageEvent {
  type: MessageEventType;
  occurredAt: string;
  response: SmtpResponse | null;
}

export type RecipientKind = "to" | "cc" | "bcc";

export interface MessageRecipient {
  address: string;
  kind: RecipientKind;
  status: RecipientStatus;
  events: MessageEvent[];
}

export interface MessageDetail {
  id: string;
  from: string;
  subject: string;
  messageIdHeader: string;
  tags: string[];
  source: MessageSource;
  sizeBytes: number;
  createdAt: string;
  recipients: MessageRecipient[];
}

export interface ListMessagesQuery extends CursorQuery {
  /** Newest first; the service's own page size when omitted. */
  limit?: number;
  /** A Message matches when one of its recipients has this status. */
  status?: RecipientStatus;
  recipient?: string;
  from?: string;
  tag?: string;
  since?: string;
  until?: string;
}

export type SuppressionReason = "bounce" | "complaint";

export interface Suppression {
  id: string;
  address: string;
  reason: SuppressionReason;
  messageId: string | null;
  createdAt: string;
}

export interface ListSuppressionsQuery extends CursorQuery {
  search?: string;
}

/** Only bounce Suppressions may be removed by the Team; a complaint stays until Nodera lifts it. */
export const isSuppressionRemovable = (suppression: Suppression): boolean =>
  suppression.reason === "bounce";

export interface Webhook {
  id: string;
  url: string;
  events: MessageEventType[];
  active: boolean;
  createdAt: string;
}

/** The creation answer: the signing secret, shown this once. */
export interface CreatedWebhook extends Webhook {
  secret: string;
}

export interface CreateWebhookPayload {
  url: string;
  events: MessageEventType[];
}

export interface UpdateWebhookPayload {
  url: string;
  events: MessageEventType[];
  active: boolean;
}

export type WebhookDeliveryStatus = "pending" | "succeeded" | "failed";

/** One batched POST of Message events to a Webhook and its attempts so far. */
export interface WebhookDelivery {
  id: string;
  status: WebhookDeliveryStatus;
  attempts: number;
  eventCount: number;
  lastStatusCode: number | null;
  lastError: string | null;
  nextAttemptAt: string | null;
  createdAt: string;
  lastAttemptAt: string | null;
}

/** Logs are kept this long; the date filter cannot reach further back. */
export const MAIL_LOG_RETENTION_DAYS = 30;
export const MAX_SENDING_DOMAINS = 10;
export const SENDING_DOMAIN_MAX_LENGTH = 253;
export const MAX_WEBHOOKS = 3;
export const WEBHOOK_URL_MAX_LENGTH = 2048;

export const RATE_KINDS = ["bounce", "complaint"] as const;
export type RateKind = (typeof RATE_KINDS)[number];

/** How the service judges one rate (spec: Daily limit, rates and Pause). */
export interface RateRule {
  /** The overview's field, and the Notification param, carrying the rate. */
  field: "bounceRate" | "complaintRate";
  /** The reason a Pause over this rate names. */
  reason: PauseReason;
  /** In percent: from `warning` on the Team is warned, from `pause` on sending is Paused. */
  warning: number;
  pause: number;
}

export const RATE_RULES: Record<RateKind, RateRule> = {
  bounce: { field: "bounceRate", reason: "bounce_rate", warning: 2, pause: 5 },
  complaint: { field: "complaintRate", reason: "complaint_rate", warning: 0.05, pause: 0.1 },
};

/** Rates are judged only over at least this many Messages in the window. */
export const RATES_MIN_MESSAGES = 500;

/** The rate a Pause was decided on; null for a reason this build does not know yet. */
export const pausedRate = (reason: string): RateKind | null =>
  RATE_KINDS.find((kind) => RATE_RULES[kind].reason === reason) ?? null;

export type RateLevel = "ok" | "warning" | "danger";

export function rateLevel(value: string, rule: RateRule): RateLevel {
  const rate = Number.parseFloat(value);
  if (Number.isNaN(rate)) return "ok";
  if (rate >= rule.pause) return "danger";
  return rate >= rule.warning ? "warning" : "ok";
}

export type SmtpSecurity = "starttls" | "tls";

export interface SmtpPort {
  port: number;
  security: SmtpSecurity;
}

/** STARTTLS on 587 and 2525, implicit TLS on 465; credentials never travel in clear. */
export const SMTP_PORTS: readonly SmtpPort[] = [
  { port: 587, security: "starttls" },
  { port: 465, security: "tls" },
  { port: 2525, security: "starttls" },
];

/** The SMTP user is always this word; the password is an API key. */
export const SMTP_USERNAME = "apikey";

/** Inlined at build time like the gateway URL (next.config.mjs `env`); empty when unset. */
export const SMTP_HOST = process.env.MAIL_SMTP_HOST ?? "";

/** Where software holding an API key calls (next.config.mjs `env`); empty when unset. */
export const INTEGRATION_API_URL = process.env.INTEGRATION_API_URL ?? "";

/** Software sends a Message here, through the integration gateway. */
export const SEND_MESSAGE_PATH = "/v1/mail/messages";

/** The shell variable the send example reads a key from where the key itself is not at hand. */
export const API_KEY_VARIABLE = "NODERA_API_KEY";

/** What the send example fills in. */
export interface SendExample {
  /** The whole key, written into the command; null reads it from {@link API_KEY_VARIABLE}. */
  apiKey: string | null;
  from: string;
  to: string;
  subject: string;
  text: string;
}

// Single quotes keep the shell from reading the body; a quote inside closes the string, adds an
// escaped one and opens it again.
const shellQuoted = (value: string): string => `'${value.replace(/'/g, "'\\''")}'`;

/** A ready-to-run curl that sends one Message with a Project API key. */
export const sendCurl = ({ apiKey, from, to, subject, text }: SendExample): string => {
  // One field a line reads like the API reference; JSON.stringify would unfold every object.
  const body = [
    "{",
    `  "from": { "email": ${JSON.stringify(from)} },`,
    `  "to": [{ "email": ${JSON.stringify(to)} }],`,
    `  "subject": ${JSON.stringify(subject)},`,
    `  "text": ${JSON.stringify(text)}`,
    "}",
  ].join("\n");

  return [
    `curl -X POST ${INTEGRATION_API_URL}${SEND_MESSAGE_PATH} \\`,
    `  -H "Authorization: Bearer ${apiKey ?? `$${API_KEY_VARIABLE}`}" \\`,
    '  -H "Content-Type: application/json" \\',
    `  -d ${shellQuoted(body)}`,
  ].join("\n");
};

/** How often the test-message panel asks for a newer Message, and for how long. */
export const TEST_MESSAGE_POLL_MS = 3000;
export const TEST_MESSAGE_WAIT_MINUTES = 10;
/** How long it follows the arrived Message's recipients before leaving the rest to the logs. */
export const TEST_MESSAGE_FOLLOW_MS = 2 * 60 * 1000;

/** Whether a recipient has an outcome no later hand-over attempt changes. */
export const isRecipientSettled = (status: RecipientStatus): boolean =>
  status !== "accepted" && status !== "deferred";

/** What choosing a Package does from where the Project stands. */
export type PackageAction =
  /** No Package yet: Mail is switched on at once. */
  | "choose"
  /** More emails: takes effect at once, what was sent stays counted. */
  | "upgrade"
  /** Fewer emails: scheduled for the next Period. */
  | "downgrade"
  /** The current Package while a change is scheduled: choosing it again undoes the change. */
  | "keep"
  /** The current Package with nothing scheduled. */
  | "current"
  /** Already the scheduled one. */
  | "scheduled";

export function packageActionFor(target: MailPackage, overview: MailOverview): PackageAction {
  const current = overview.package;
  if (!current) return "choose";
  if (target.code === current.code) return overview.scheduledChange ? "keep" : "current";
  if (overview.scheduledChange?.code === target.code) return "scheduled";
  return target.monthlyEmails > current.monthlyEmails ? "upgrade" : "downgrade";
}

export const isCancellationScheduled = (overview: MailOverview): boolean =>
  overview.scheduledChange?.code === NO_PACKAGE;

/** What keeps a Package from being chosen: no card yet, or an unpaid invoice. */
export type PackageBlock = Exclude<BillingStatusValue, "active">;

/**
 * Every choice but a cancellation needs an `active` Billing status: starting, upgrading,
 * scheduling a smaller Package and undoing a scheduled change (402 without a card, 423 when
 * suspended). Null when nothing blocks them.
 */
export const packageBlock = (overview: MailOverview): PackageBlock | null =>
  overview.billingStatus === "active" ? null : overview.billingStatus;

/** A share in whole percent for a progress bar, capped at 100. */
export function usagePercent(used: number, total: number): number {
  if (total <= 0) return used > 0 ? 100 : 0;
  return Math.min(100, Math.floor((used / total) * 100));
}

/** The Package of the catalog with this code; null for `none` or an unknown one. */
export const packageByCode = (
  packages: readonly MailPackage[],
  code: string | null | undefined
): MailPackage | null => packages.find((item) => item.code === code) ?? null;

/**
 * The Mail App's entry route. Mail notification emails link to it as
 * `?team=<teamID>&project=<projectID>`: the Team is selected and the Project remembered, then
 * the Project's overview opens.
 */
export const MAIL_LANDING_PATH = "/dashboard/mail";
export const MAIL_TEAM_PARAM = "team";
export const MAIL_PROJECT_PARAM = "project";

export const MAIL_SECTIONS = ["domains", "logs", "suppressions", "webhooks"] as const;
export type MailSection = (typeof MAIL_SECTIONS)[number];

/** The Mail App of a Project: its overview, or one of its sections. */
export const mailPath = (projectId: string, section?: MailSection): string =>
  `${projectPath(projectId)}/mail${section ? `/${section}` : ""}`;

export const sendingDomainPath = (projectId: string, domainId: string): string =>
  `${mailPath(projectId, "domains")}/${domainId}`;

/** The logs' parameter naming the Message whose detail opens over them. */
export const MAIL_MESSAGE_PARAM = "message";

export const messagePath = (projectId: string, messageId: string): string =>
  `${mailPath(projectId, "logs")}?${MAIL_MESSAGE_PARAM}=${encodeURIComponent(messageId)}`;
