import { billingPath } from "./billing";
import {
  MAIL_LANDING_PATH,
  RATE_RULES,
  mailPath,
  pausedRate,
  sendingDomainPath,
} from "./mail";
import { KUBERNETES_LANDING_PATH, clusterPath } from "./kubernetesApp";
import { DASHBOARD_PATH, TEAM_PATH } from "./routes";
import { STORAGE_LANDING_PATH, isStoragePauseReason, storagePath } from "./storageApp";
import type { Team } from "./team";

/**
 * One Notification of the user's Inbox. The Inbox spans every Team the user is in; `teamId` is
 * null for one about the user alone. `type` stays a plain string: the service may add types
 * before the web app learns them.
 */
export interface Notification {
  id: string;
  type: string;
  teamId: string | null;
  /** Per-type values for the text and the link (camelized like every payload). */
  params: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
}

export interface UnreadNotificationCount {
  count: number;
}

export interface MarkedNotificationCount {
  count: number;
}

export interface ListNotificationsQuery {
  /** The id of the last Notification already shown; omitted for the first page. */
  before?: string;
  limit?: number;
}

/** The text a Notification is shown with, resolved per type in the user's language. */
export interface NotificationText {
  title: string;
  description: string | null;
}

export type NotificationTone = "success" | "error" | "warning" | "info";

/**
 * A change to apply to a list already on screen: a Notification pushed live, or reads made in
 * this tab or another one. Lists apply it instead of refetching.
 */
export type InboxChange =
  | { kind: "created"; notification: Notification }
  | { kind: "read"; ids: string[]; at: string }
  | { kind: "readAll"; at: string };

/** A loaded stretch of the Inbox, newest first. */
export interface NotificationPage {
  items: Notification[];
  hasMore: boolean;
}

export const NOTIFICATIONS_PATH = "/dashboard/notifications";
/** The service caps a page at 50 and defaults to 20. */
export const NOTIFICATION_PAGE_SIZE = 20;

/** A param as text; anything missing or of another shape reads as empty, never throws. */
export const notificationParam = (notification: Notification, key: string): string => {
  const value = notification.params?.[key];
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
};

/**
 * What a text builder is handed to word a Notification in the user's language. The hook that
 * resolves texts supplies it, which keeps the map below free of React and next-intl.
 */
export interface NotificationWording {
  /** A message of `notifications.types`, by its key there. */
  t: (key: string, values?: Record<string, string>) => string;
  /** A Team Role's label; one this build does not know reads as given. */
  role: (role: string) => string;
  /** Why a Droplet failed, from its failure code. */
  dropletFailure: (code: string) => string;
  /** Why a Cluster failed, from its failure code. */
  kubernetesFailure: (code: string) => string;
  date: (value: string) => string;
  dateTime: (value: string) => string;
  /** A billing Period as the invoice list shows it. */
  period: (start: string, end: string) => string;
  money: (amount: string, currency: string) => string;
  /** A whole number with the locale's grouping ("10,000"). */
  count: (value: string) => string;
  /** A rate sent as a two-decimal percentage string ("2.40" is 2.40%). */
  percent: (value: string) => string;
  /** A Mail Period sent as `YYYY-MM`, named as its month. */
  month: (period: string) => string;
  /** A Storage size in bytes, in decimal units ("10 GB"). */
  size: (bytes: string) => string;
}

/** Everything the app does differently per Notification type. */
export interface NotificationKind {
  /** The icon, colour and toast kind. */
  tone: NotificationTone;
  text: (notification: Notification, wording: NotificationWording) => NotificationText;
  /** Where clicking it leads once it is marked read; null when there is nothing to open. */
  path: (notification: Notification) => string | null;
  /**
   * The param naming its Team, read when the user's Teams cannot name it: an Invitation's or a
   * removal's Team is one the user is not in.
   */
  teamNameParam?: string;
  /** A list the app keeps elsewhere that a push of this type leaves stale. */
  refreshes?: "invitations";
}

const dropletPath = (notification: Notification): string | null => {
  const dropletId = notificationParam(notification, "dropletId");
  return dropletId ? `/dashboard/droplets/${dropletId}` : null;
};

/** Mail's in-app texts name the Project; the params carry its name, never a sentence. */
const mailProject = (notification: Notification): string =>
  notificationParam(notification, "projectName");

const mailOverviewPath = (notification: Notification): string => {
  const projectId = notificationParam(notification, "projectId");
  return projectId ? mailPath(projectId) : MAIL_LANDING_PATH;
};

const mailDomainPath = (notification: Notification): string => {
  const projectId = notificationParam(notification, "projectId");
  const domainId = notificationParam(notification, "sendingDomainId");
  if (!projectId) return MAIL_LANDING_PATH;
  return domainId ? sendingDomainPath(projectId, domainId) : mailPath(projectId, "domains");
};

const packageUsage = (
  notification: Notification,
  wording: NotificationWording
): Record<string, string> => ({
  project: mailProject(notification),
  package: notificationParam(notification, "packageCode"),
  used: wording.count(notificationParam(notification, "used")),
  allowance: wording.count(notificationParam(notification, "allowance")),
  month: wording.month(notificationParam(notification, "period")),
});

/** Storage's in-app texts name the Storage by its Bucket name; the params carry it, never a sentence. */
const bucketName = (notification: Notification): string =>
  notificationParam(notification, "bucketName");

const storageDetailPath = (notification: Notification): string => {
  const projectId = notificationParam(notification, "projectId");
  const storageId = notificationParam(notification, "storageId");
  return projectId && storageId ? storagePath(projectId, storageId) : STORAGE_LANDING_PATH;
};

const storageSettingsPath = (notification: Notification): string => {
  const projectId = notificationParam(notification, "projectId");
  const storageId = notificationParam(notification, "storageId");
  return projectId && storageId
    ? storagePath(projectId, storageId, "settings")
    : STORAGE_LANDING_PATH;
};

const storageFill = (
  notification: Notification,
  wording: NotificationWording
): Record<string, string> => ({
  bucket: bucketName(notification),
  package: notificationParam(notification, "packageCode"),
  used: wording.size(notificationParam(notification, "usedBytes")),
  size: wording.size(notificationParam(notification, "sizeBytes")),
});

/** Kubernetes' in-app texts name the Cluster; the params carry its name, never a sentence. */
const clusterName = (notification: Notification): string =>
  notificationParam(notification, "name");

const clusterDetailPath = (notification: Notification): string => {
  const projectId = notificationParam(notification, "projectId");
  const clusterId = notificationParam(notification, "clusterId");
  return projectId && clusterId ? clusterPath(projectId, clusterId) : KUBERNETES_LANDING_PATH;
};

/** The emails link an invoice the same way; the billing page selects the Team it names. */
const invoicePath = (notification: Notification): string =>
  billingPath(
    "invoices",
    notificationParam(notification, "invoiceId") || null,
    notification.teamId
  );

const invoiceNumber = (notification: Notification): string =>
  notificationParam(notification, "invoiceNumber");

const amount = (notification: Notification, wording: NotificationWording): string =>
  wording.money(
    notificationParam(notification, "amount"),
    notificationParam(notification, "currency")
  );

/** Printed the way the card itself prints it, as the payment method list does. */
const cardExpiry = (notification: Notification): string => {
  const month = notificationParam(notification, "expMonth");
  const year = notificationParam(notification, "expYear");
  return month && year ? `${month.padStart(2, "0")} / ${year}` : "";
};

/**
 * The one place a Notification type is looked up: its tone, text, page and Team label. A type
 * missing here (the service may add one before the web app learns it) gets the generic kind.
 */
const NOTIFICATION_KINDS = {
  droplet_active: {
    tone: "success",
    text: (notification, wording) => {
      const ipv4 = notificationParam(notification, "ipv4");
      return {
        title: wording.t("droplet_active.title", {
          hostname: notificationParam(notification, "hostname"),
        }),
        description: ipv4 ? wording.t("droplet_active.description", { ipv4 }) : null,
      };
    },
    path: dropletPath,
  },
  droplet_failed: {
    tone: "error",
    text: (notification, wording) => ({
      title: wording.t("droplet_failed.title", {
        hostname: notificationParam(notification, "hostname"),
      }),
      description: wording.dropletFailure(notificationParam(notification, "failureCode")),
    }),
    path: dropletPath,
  },
  invoice_issued: {
    tone: "info",
    text: (notification, wording) => ({
      title: wording.t("invoice_issued.title", { number: invoiceNumber(notification) }),
      description: wording.t("invoice_issued.description", {
        total: wording.money(
          notificationParam(notification, "totalDue"),
          notificationParam(notification, "currency")
        ),
        period: wording.period(
          notificationParam(notification, "periodStart"),
          notificationParam(notification, "periodEnd")
        ),
      }),
    }),
    path: invoicePath,
  },
  payment_succeeded: {
    tone: "success",
    text: (notification, wording) => ({
      title: wording.t("payment_succeeded.title", { number: invoiceNumber(notification) }),
      description: wording.t("payment_succeeded.description", {
        amount: amount(notification, wording),
      }),
    }),
    path: invoicePath,
  },
  payment_failed: {
    tone: "error",
    text: (notification, wording) => {
      const nextRetryAt = notificationParam(notification, "nextRetryAt");
      return {
        title: wording.t("payment_failed.title", { number: invoiceNumber(notification) }),
        description: nextRetryAt
          ? wording.t("payment_failed.description", {
              amount: amount(notification, wording),
              date: wording.dateTime(nextRetryAt),
            })
          : wording.t("payment_failed.descriptionNoRetry", {
              amount: amount(notification, wording),
            }),
      };
    },
    path: invoicePath,
  },
  payment_confirmation_required: {
    tone: "warning",
    text: (notification, wording) => ({
      title: wording.t("payment_confirmation_required.title", {
        number: invoiceNumber(notification),
      }),
      description: wording.t("payment_confirmation_required.description", {
        amount: amount(notification, wording),
      }),
    }),
    path: invoicePath,
  },
  team_suspended: {
    tone: "error",
    text: (notification, wording) => ({
      title: wording.t("team_suspended.title"),
      description: wording.t("team_suspended.description", {
        number: invoiceNumber(notification),
      }),
    }),
    path: invoicePath,
  },
  droplets_deletion_warning: {
    tone: "error",
    text: (notification, wording) => ({
      title: wording.t("droplets_deletion_warning.title"),
      description: wording.t("droplets_deletion_warning.description", {
        number: invoiceNumber(notification),
        date: wording.dateTime(notificationParam(notification, "deletionAt")),
      }),
    }),
    path: invoicePath,
  },
  card_expiring: {
    tone: "warning",
    text: (notification, wording) => ({
      title: wording.t("card_expiring.title", {
        brand: notificationParam(notification, "brand"),
        last4: notificationParam(notification, "last4"),
      }),
      description: wording.t("card_expiring.description", {
        expiry: cardExpiry(notification),
      }),
    }),
    path: (notification) => billingPath("payment-methods", null, notification.teamId),
  },
  team_invitation: {
    tone: "info",
    text: (notification, wording) => ({
      title: wording.t("team_invitation.title", {
        name: notificationParam(notification, "inviterName"),
        team: notificationParam(notification, "teamName"),
        role: wording.role(notificationParam(notification, "role")),
      }),
      description: wording.t("team_invitation.description", {
        date: wording.date(notificationParam(notification, "expiresAt")),
      }),
    }),
    // A signed-in user answers Invitations from the navbar's menu, shown on every page.
    path: () => DASHBOARD_PATH,
    teamNameParam: "teamName",
    refreshes: "invitations",
  },
  team_role_changed: {
    tone: "info",
    text: (notification, wording) => ({
      title: wording.t("team_role_changed.title", {
        team: notificationParam(notification, "teamName"),
        role: wording.role(notificationParam(notification, "role")),
      }),
      description: null,
    }),
    path: () => TEAM_PATH,
    teamNameParam: "teamName",
  },
  team_member_removed: {
    tone: "warning",
    text: (notification, wording) => ({
      title: wording.t("team_member_removed.title", {
        team: notificationParam(notification, "teamName"),
      }),
      description: wording.t("team_member_removed.description"),
    }),
    // Nothing of the Team is open to the user any more.
    path: () => null,
    teamNameParam: "teamName",
  },
  mail_domain_verified: {
    tone: "success",
    text: (notification, wording) => ({
      title: wording.t("mail_domain_verified.title", {
        domain: notificationParam(notification, "domain"),
      }),
      description: wording.t("mail_domain_verified.description", {
        project: mailProject(notification),
      }),
    }),
    path: mailDomainPath,
  },
  mail_domain_unverified: {
    tone: "error",
    text: (notification, wording) => ({
      title: wording.t("mail_domain_unverified.title", {
        domain: notificationParam(notification, "domain"),
      }),
      description: wording.t("mail_domain_unverified.description", {
        project: mailProject(notification),
      }),
    }),
    path: mailDomainPath,
  },
  mail_package_near_limit: {
    tone: "warning",
    text: (notification, wording) => ({
      title: wording.t("mail_package_near_limit.title", {
        project: mailProject(notification),
      }),
      description: wording.t(
        "mail_package_near_limit.description",
        packageUsage(notification, wording)
      ),
    }),
    path: mailOverviewPath,
  },
  mail_package_exhausted: {
    tone: "error",
    text: (notification, wording) => ({
      title: wording.t("mail_package_exhausted.title", { project: mailProject(notification) }),
      description: wording.t(
        "mail_package_exhausted.description",
        packageUsage(notification, wording)
      ),
    }),
    path: mailOverviewPath,
  },
  mail_rates_warning: {
    tone: "warning",
    text: (notification, wording) => ({
      title: wording.t("mail_rates_warning.title", { project: mailProject(notification) }),
      description: wording.t("mail_rates_warning.description", {
        bounce: wording.percent(notificationParam(notification, "bounceRate")),
        complaint: wording.percent(notificationParam(notification, "complaintRate")),
        days: notificationParam(notification, "windowDays") || "7",
      }),
    }),
    path: mailOverviewPath,
  },
  mail_paused: {
    tone: "error",
    text: (notification, wording) => {
      const rateKind = pausedRate(notificationParam(notification, "reason"));
      return {
        title: wording.t("mail_paused.title", { project: mailProject(notification) }),
        description: rateKind
          ? wording.t(`mail_paused.reasons.${rateKind}`, {
              rate: wording.percent(
                notificationParam(notification, RATE_RULES[rateKind].field)
              ),
            })
          : wording.t("mail_paused.description"),
      };
    },
    path: mailOverviewPath,
  },
  storage_nearly_full: {
    tone: "warning",
    text: (notification, wording) => ({
      title: wording.t("storage_nearly_full.title", { bucket: bucketName(notification) }),
      description: wording.t(
        "storage_nearly_full.description",
        storageFill(notification, wording)
      ),
    }),
    path: storageSettingsPath,
  },
  storage_full: {
    tone: "error",
    text: (notification, wording) => ({
      title: wording.t("storage_full.title", { bucket: bucketName(notification) }),
      description: wording.t("storage_full.description", storageFill(notification, wording)),
    }),
    path: storageSettingsPath,
  },
  storage_paused: {
    tone: "error",
    text: (notification, wording) => {
      const reason = notificationParam(notification, "reason");
      return {
        title: wording.t("storage_paused.title", { bucket: bucketName(notification) }),
        description: isStoragePauseReason(reason)
          ? wording.t(`storage_paused.reasons.${reason}`)
          : wording.t("storage_paused.description"),
      };
    },
    path: storageDetailPath,
  },
  storage_downgrade_skipped: {
    tone: "warning",
    text: (notification, wording) => ({
      title: wording.t("storage_downgrade_skipped.title", {
        bucket: bucketName(notification),
      }),
      description: wording.t("storage_downgrade_skipped.description", {
        package: notificationParam(notification, "packageCode"),
        skipped: notificationParam(notification, "skippedPackageCode"),
        skippedSize: wording.size(notificationParam(notification, "skippedSizeBytes")),
        used: wording.size(notificationParam(notification, "usedBytes")),
      }),
    }),
    path: storageSettingsPath,
  },
  kubernetes_cluster_running: {
    tone: "success",
    text: (notification, wording) => ({
      title: wording.t("kubernetes_cluster_running.title", {
        name: clusterName(notification),
      }),
      description: wording.t("kubernetes_cluster_running.description", {
        project: notificationParam(notification, "projectName"),
      }),
    }),
    path: clusterDetailPath,
  },
  kubernetes_cluster_failed: {
    tone: "error",
    text: (notification, wording) => ({
      title: wording.t("kubernetes_cluster_failed.title", { name: clusterName(notification) }),
      description: wording.kubernetesFailure(notificationParam(notification, "failureCode")),
    }),
    path: clusterDetailPath,
  },
} satisfies Record<string, NotificationKind>;

/** The types this build has a kind for; any other one gets the generic kind. */
export type NotificationType = keyof typeof NOTIFICATION_KINDS;

const UNKNOWN_KIND: NotificationKind = {
  tone: "info",
  text: (_notification, wording) => ({ title: wording.t("unknown.title"), description: null }),
  path: () => null,
};

export const isKnownNotificationType = (type: string): type is NotificationType =>
  Object.hasOwn(NOTIFICATION_KINDS, type);

export const notificationKind = (notification: Notification): NotificationKind =>
  isKnownNotificationType(notification.type)
    ? NOTIFICATION_KINDS[notification.type]
    : UNKNOWN_KIND;

/**
 * The Team a row or a toast names: one of the user's Teams by `teamId`, else the name the
 * params carry for a Team the user is not in; null for a Notification about the user alone.
 */
export const notificationTeamName = (
  notification: Notification,
  teams: readonly Team[]
): string | null => {
  const team = notification.teamId
    ? teams.find((item) => item.id === notification.teamId)
    : undefined;
  if (team) return team.name;
  const param = notificationKind(notification).teamNameParam;
  return (param && notificationParam(notification, param)) || null;
};

export const createdAtMs = (notification: Notification): number =>
  new Date(notification.createdAt).getTime();

const markRead = (notification: Notification, at: string): Notification =>
  notification.readAt ? notification : { ...notification, readAt: at };

export function applyInboxChange(items: Notification[], change: InboxChange): Notification[] {
  switch (change.kind) {
    case "created":
      return items.some((item) => item.id === change.notification.id)
        ? items
        : [change.notification, ...items];
    case "read": {
      const ids = new Set(change.ids);
      return items.map((item) => (ids.has(item.id) ? markRead(item, change.at) : item));
    }
    case "readAll":
      return items.map((item) => markRead(item, change.at));
  }
}

/**
 * Folds a refetched first page into what is shown, which may hold older pages and items pushed
 * while the request ran. Notifications are never deleted, so everything shown stays; the page
 * wins for the items it carries (their read state is the server's).
 */
export function mergeFirstPage(
  current: NotificationPage,
  page: Notification[],
  pageSize: number
): NotificationPage {
  const fetched = new Set(page.map((item) => item.id));
  const rest = current.items.filter((item) => !fetched.has(item.id));
  const items = [...page, ...rest].sort((a, b) => createdAtMs(b) - createdAtMs(a));
  // A short page is the whole Inbox; anything else shown arrived after the request.
  if (page.length < pageSize) return { items, hasMore: false };
  const tail = createdAtMs(page[page.length - 1]);
  const keptOlder = rest.some((item) => createdAtMs(item) < tail);
  return { items, hasMore: keptOlder ? current.hasMore : true };
}

export function appendPage(
  current: NotificationPage,
  page: Notification[],
  pageSize: number
): NotificationPage {
  const shown = new Set(current.items.map((item) => item.id));
  return {
    items: [...current.items, ...page.filter((item) => !shown.has(item.id))],
    hasMore: page.length >= pageSize,
  };
}
