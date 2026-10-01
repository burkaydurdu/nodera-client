export type DropletStatus =
  "provisioning" | "active" | "off" | "failed" | "deleting" | "deleted";

export type DropletActionType = "power_on" | "power_off" | "reboot";

export interface DropletSSHKey {
  name: string;
  fingerprint: string;
}

export interface DropletTransition {
  from: DropletStatus | "";
  to: DropletStatus;
  at: string;
  reason: string;
}

export interface Droplet {
  id: string;
  projectId: string;
  hostname: string;
  status: DropletStatus;
  planCode: string;
  regionCode: string;
  imageCode: string;
  ipv4: string | null;
  ipv6: string | null;
  /** Locked at creation; never follows the catalog. */
  hourlyPrice: string;
  monthlyPrice: string;
  sshKeys: DropletSSHKey[];
  failureReason: string | null;
  createdAt: string;
  activeAt: string | null;
  deletionRequestedAt: string | null;
  /** Only the detail endpoint carries the status history. */
  history?: DropletTransition[];
}

export interface CreateDropletKey {
  name: string;
  publicKey: string;
}

export interface CreateDropletPayload {
  plan: string;
  region: string;
  image: string;
  hostname: string;
  sshKeys: CreateDropletKey[];
}

export interface DropletActionPayload {
  type: DropletActionType;
}

/** Statuses the poller may still move; the UI keeps refreshing while any Droplet is in one. */
export const TRANSITIONAL_STATUSES: readonly DropletStatus[] = ["provisioning", "deleting"];

export const isTransitional = (status: DropletStatus): boolean =>
  TRANSITIONAL_STATUSES.includes(status);

/** Power actions are accepted by the service from these statuses only. */
export const ACTIONABLE_STATUSES: readonly DropletStatus[] = ["active", "off"];

export const canAct = (status: DropletStatus): boolean => ACTIONABLE_STATUSES.includes(status);

export const HOSTNAME_MIN_LENGTH = 1;
export const HOSTNAME_MAX_LENGTH = 63;
export const MIN_SSH_KEYS = 1;
export const MAX_SSH_KEYS = 10;

/** RFC 1123 label: lowercase letters, digits and hyphens, no leading or trailing hyphen. */
const HOSTNAME_PATTERN = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;

export type HostnameIssue = "required" | "tooLong" | "charset" | "hyphenEdge";

export function validateHostname(value: string): HostnameIssue | null {
  if (value.length < HOSTNAME_MIN_LENGTH) return "required";
  if (value.length > HOSTNAME_MAX_LENGTH) return "tooLong";
  if (/[^a-z0-9-]/.test(value)) return "charset";
  if (value.startsWith("-") || value.endsWith("-")) return "hyphenEdge";
  return HOSTNAME_PATTERN.test(value) ? null : "charset";
}

/** Poll interval for lists and details while a Droplet is transitional. */
export const DROPLET_POLL_INTERVAL_MS = 10_000;

/** How long the web app keeps retrying "project not found" right after a Project was created (ADR-0004). */
export const PROJECT_ACCESS_RETRY_MS = 5_000;
export const PROJECT_ACCESS_RETRY_INTERVAL_MS = 1_000;
