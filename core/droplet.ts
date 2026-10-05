import { projectPath } from "./project";

export type DropletStatus =
  "provisioning" | "active" | "off" | "failed" | "deleting" | "deleted";

export type DropletActionType = "power_on" | "power_off" | "reboot";

/** Why a Droplet failed, as a code the web app words in the user's language. */
export const DROPLET_FAILURE_CODES = [
  "rejected",
  "unavailable",
  "timed_out",
  "server_gone",
  "provider_failed",
] as const;
export type DropletFailureCode = (typeof DROPLET_FAILURE_CODES)[number];

export const isDropletFailureCode = (
  value: string | null | undefined
): value is DropletFailureCode =>
  !!value && (DROPLET_FAILURE_CODES as readonly string[]).includes(value);

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
  /**
   * Set once failed. The service may add a code before the web app learns it; one this build
   * does not know reads as `unavailable`.
   */
  failureCode: DropletFailureCode | null;
  /** The service's English sentence: shown only for a failure it never coded. */
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

/** Statuses the poller may still move; a fallback poll runs while any Droplet is in one. */
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

/**
 * Poll interval for lists and details while a Droplet is transitional. A status change is
 * pushed over the realtime socket; this only covers a push that never arrived.
 */
export const DROPLET_FALLBACK_POLL_INTERVAL_MS = 60_000;

/** A Droplet's own page lives under it; the Droplet names its Project itself. */
export const DROPLETS_PATH = "/dashboard/droplets";

/** A Project's Droplet pages under its own page, the create flow among them. */
export const projectDropletsPath = (projectId: string): string =>
  `${projectPath(projectId)}/droplets`;
