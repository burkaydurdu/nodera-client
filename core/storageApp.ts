/**
 * Storage types as the storage service's management API declares them (snake_case on the
 * wire). The Storage product, not the browser's storage: that one is `core/storage.ts`.
 */
import type { BillingStatusValue } from "./billing";
import { projectPath } from "./project";

/** One Region a Storage can be opened in; the launch Region is `vno1`. */
export interface StorageRegion {
  code: string;
  city: string;
  country: string;
}

/** One Package of the catalog; `GET /v1/storage/packages` lists them smallest first. */
export interface StoragePackage {
  code: string;
  sizeBytes: number;
  /** USD per month excluding taxes, two decimals ("3.00"). */
  monthlyPrice: string;
}

/** The Storage's Package: the catalog entry copied, price included, when it was chosen. */
export interface HeldStoragePackage extends StoragePackage {
  startedAt: string;
}

/** A smaller Package waiting for the next Period, with the terms copied when it was scheduled. */
export interface ScheduledStorageChange extends StoragePackage {
  effectiveAt: string;
}

/** Why Nodera stopped a Storage; worded per code in the web app. */
export const STORAGE_PAUSE_REASONS = [
  "abuse_complaint",
  "malware",
  "phishing",
  "legal",
] as const;
export type StoragePauseReason = (typeof STORAGE_PAUSE_REASONS)[number];

export const isStoragePauseReason = (
  value: string | null | undefined
): value is StoragePauseReason =>
  !!value && (STORAGE_PAUSE_REASONS as readonly string[]).includes(value);

export interface StoragePause {
  reason: string;
  pausedAt: string;
}

/** Whether the Storage still exists; what the web app shows on top of it is `state`. */
export type StorageStatus = "active" | "deleting";

/** The first thing stopping the Storage right now, or `active` when nothing does. */
export type StorageState = "deleting" | "suspended" | "paused" | "full" | "active";

export interface Storage {
  id: string;
  projectId: string;
  /** Never changes; unique in its Region. */
  bucketName: string;
  region: string;
  /** What S3 tools are configured with. */
  endpoint: string;
  /** Where the bucket itself answers. */
  url: string;
  status: StorageStatus;
  state: StorageState;
  package: HeldStoragePackage;
  scheduledChange: ScheduledStorageChange | null;
  usedBytes: number;
  objectCount: number;
  /** When the size was last read from the engine; null before the first measure. */
  measuredAt: string | null;
  pause: StoragePause | null;
  /** The Team's Billing status as Storage last learned it. */
  billingStatus: BillingStatusValue;
  createdAt: string;
}

export interface OpenStoragePayload {
  bucketName: string;
  region: string;
  /** A code of the catalog. */
  package: string;
}

export interface ChooseStoragePackagePayload {
  code: string;
}

export type AccessKeyPermission = "read" | "read_write";

export const ACCESS_KEY_PERMISSIONS: readonly AccessKeyPermission[] = ["read", "read_write"];

export interface AccessKey {
  id: string;
  name: string;
  accessKeyId: string;
  permission: AccessKeyPermission;
  createdBy: string;
  createdAt: string;
}

/** The creation answer: the secret key, shown this once. */
export interface CreatedAccessKey extends AccessKey {
  secretKey: string;
}

export interface CreateAccessKeyPayload {
  name: string;
  permission: AccessKeyPermission;
}

export interface StorageObject {
  key: string;
  size: number;
  modifiedAt: string;
}

/** One page of a folder; a null cursor means the folder ends here. */
export interface ObjectListing {
  prefix: string;
  folders: string[];
  objects: StorageObject[];
  nextCursor: string | null;
}

export interface ListObjectsQuery {
  /** The folder, ending in "/", or empty for the root. */
  prefix?: string;
  cursor?: string;
}

export interface DeleteObjectsPayload {
  keys: string[];
}

/** Whether anyone may read an object without a key; writing always needs one. */
export interface ObjectAccess {
  key: string;
  url: string;
  public: boolean;
}

export interface SetObjectAccessPayload {
  key: string;
  public: boolean;
}

export interface ObjectUrlPayload {
  key: string;
  /** The type the browser will send with an upload; it is signed into the URL. */
  contentType?: string;
}

/** `contentType`, when set, was signed into the URL and must be sent as the Content-Type exactly. */
export interface PresignedUrl {
  url: string;
  method: string;
  contentType?: string;
  expiresAt: string;
}

export interface StorageUsageDay {
  /** A UTC day as `YYYY-MM-DD`. */
  day: string;
  usedBytes: number;
  objectCount: number;
  bytesSent: number;
  bytesReceived: number;
  requests: number;
}

export interface StorageUsage {
  storageId: string;
  days: StorageUsageDay[];
}

export const BUCKET_NAME_MIN_LENGTH = 3;
export const BUCKET_NAME_MAX_LENGTH = 63;
export const ACCESS_KEY_NAME_MAX_LENGTH = 64;
export const MAX_STORAGES_PER_PROJECT = 100;
export const MAX_ACCESS_KEYS_PER_STORAGE = 20;
/** The browser sends one file in a single PUT; anything larger belongs to an S3 tool. */
export const MAX_BROWSER_UPLOAD_BYTES = 5_000_000_000;
/** One delete request takes at most this many keys. */
export const MAX_OBJECTS_PER_DELETE = 1000;
/** The share of the Package at which the Storage is told it is nearly full. */
export const NEARLY_FULL_PERCENT = 80;
/** The traffic the usage page shows reaches back this far. */
export const USAGE_DAYS = 30;

export type BucketNameIssue =
  "required" | "tooShort" | "tooLong" | "charset" | "edge" | "dots";

/**
 * The Bucket name rules as the service checks them, before the request: 3 to 63 lower-case
 * letters, digits and hyphens, starting and ending with a letter or a digit, no dots. The
 * reserved list stays the service's; a reserved name answers 400 and is told as such.
 */
export function validateBucketName(value: string): BucketNameIssue | null {
  if (value.length === 0) return "required";
  if (value.includes(".")) return "dots";
  if (value.length < BUCKET_NAME_MIN_LENGTH) return "tooShort";
  if (value.length > BUCKET_NAME_MAX_LENGTH) return "tooLong";
  if (/[^a-z0-9-]/.test(value)) return "charset";
  if (value.startsWith("-") || value.endsWith("-")) return "edge";
  return null;
}

/** How a typed Bucket name is sent: lower-cased and trimmed, like the field keeps it. */
export const normalizeBucketName = (value: string): string => value.trim().toLowerCase();

/** A share in whole percent for a fullness bar, capped at 100. */
export function fullnessPercent(used: number, total: number): number {
  if (total <= 0) return used > 0 ? 100 : 0;
  return Math.min(100, Math.floor((used / total) * 100));
}

export const isNearlyFull = (storage: Storage): boolean =>
  fullnessPercent(storage.usedBytes, storage.package.sizeBytes) >= NEARLY_FULL_PERCENT;

/** A Storage on its way out takes no change of Package, Access key or file. */
export const isDeleting = (storage: Storage): boolean => storage.status === "deleting";

/** A stopped Storage refuses the browser too (423): Paused, or its Team suspended. */
export const isStopped = (storage: Storage): boolean =>
  storage.state === "paused" || storage.state === "suspended";

/** Writes are refused (full, stopped or deleting); reads keep working while it is only full. */
export const canWriteObjects = (storage: Storage): boolean => storage.state === "active";

export const canReadObjects = (storage: Storage): boolean =>
  !isDeleting(storage) && !isStopped(storage);

/** What choosing a Package does from where the Storage stands. */
export type StoragePackageAction =
  /** More room: takes effect at once. */
  | "upgrade"
  /** Less room: scheduled for the next Period, if the Storage fits it. */
  | "downgrade"
  /** The current Package while a change is scheduled: choosing it again undoes the change. */
  | "keep"
  /** The current Package with nothing scheduled. */
  | "current"
  /** Already the scheduled one. */
  | "scheduled";

export function storagePackageActionFor(
  target: StoragePackage,
  storage: Storage
): StoragePackageAction {
  if (target.code === storage.package.code)
    return storage.scheduledChange ? "keep" : "current";
  if (storage.scheduledChange?.code === target.code) return "scheduled";
  return target.sizeBytes > storage.package.sizeBytes ? "upgrade" : "downgrade";
}

/** A smaller Package the Storage already holds more than is refused (409); told before asking. */
export const fitsPackage = (target: StoragePackage, storage: Storage): boolean =>
  storage.usedBytes <= target.sizeBytes;

/** What keeps a Package from being changed: no card yet, or an unpaid invoice. */
export type StoragePackageBlock = Exclude<BillingStatusValue, "active">;

/**
 * Every change of Package needs an `active` Billing status (402 without a card, 423 when
 * suspended). Null when nothing blocks it.
 */
export const storagePackageBlock = (storage: Storage): StoragePackageBlock | null =>
  storage.billingStatus === "active" ? null : storage.billingStatus;

/** The Package of the catalog with this code; null for an unknown one. */
export const storagePackageByCode = (
  packages: readonly StoragePackage[],
  code: string | null | undefined
): StoragePackage | null => packages.find((item) => item.code === code) ?? null;

/** Package codes sort by size, so a list reads smallest first whatever order it arrived in. */
export const bySize = (a: StoragePackage, b: StoragePackage): number =>
  a.sizeBytes - b.sizeBytes;

export const OBJECT_DELIMITER = "/";

/** The Files page's parameter naming the folder on screen, so the back button steps out of it. */
export const OBJECT_PREFIX_PARAM = "prefix";

/** The folder an object key sits in ("a/b/c.txt" → "a/b/"), or "" at the root. */
export const parentPrefix = (key: string): string => {
  const index = key.lastIndexOf(OBJECT_DELIMITER);
  return index === -1 ? "" : key.slice(0, index + 1);
};

/** The last segment of a key or a folder prefix, as the browser lists it. */
/**
 * Where an object answers: its key under the Storage's URL, each segment escaped the way a
 * browser needs it. Works for a published object, or with an Access key for a private one.
 */
export const objectUrl = (bucketUrl: string, key: string) =>
  `${bucketUrl.replace(/\/+$/, "")}/${key.split("/").map(encodeURIComponent).join("/")}`;

export const baseName = (key: string): string => {
  const trimmed = key.endsWith(OBJECT_DELIMITER) ? key.slice(0, -1) : key;
  const index = trimmed.lastIndexOf(OBJECT_DELIMITER);
  return index === -1 ? trimmed : trimmed.slice(index + 1);
};

/** Every folder on the way to a prefix, the root first: "a/b/" → ["", "a/", "a/b/"]. */
export function prefixCrumbs(prefix: string): string[] {
  const crumbs = [""];
  let current = "";
  for (const segment of prefix.split(OBJECT_DELIMITER).filter(Boolean)) {
    current = `${current}${segment}${OBJECT_DELIMITER}`;
    crumbs.push(current);
  }
  return crumbs;
}

/**
 * The Storage App's entry route. Storage notification emails link to it as
 * `?team=<teamID>&project=<projectID>&storage=<storageID>`: the Team is selected and the
 * Project remembered, then the Storage opens.
 */
export const STORAGE_LANDING_PATH = "/dashboard/storage";
export const STORAGE_TEAM_PARAM = "team";
export const STORAGE_PROJECT_PARAM = "project";
export const STORAGE_STORAGE_PARAM = "storage";

/** A Project's Storages. */
export const storagesPath = (projectId: string): string => `${projectPath(projectId)}/storage`;

export const newStoragePath = (projectId: string): string => `${storagesPath(projectId)}/new`;

export const STORAGE_SECTIONS = ["access-keys", "usage", "settings"] as const;
export type StorageSection = (typeof STORAGE_SECTIONS)[number];

/** One Storage's pages: its files at the root, then a section. */
export const storagePath = (
  projectId: string,
  storageId: string,
  section?: StorageSection
): string => `${storagesPath(projectId)}/${storageId}${section ? `/${section}` : ""}`;

/** The Storage a page is about, read from its path; null for the list and the open form. */
export function storageOfPath(pathname: string, projectId: string): string | null {
  const base = `${storagesPath(projectId)}/`;
  if (!pathname.startsWith(base)) return null;
  const storageId = pathname.slice(base.length).split("/")[0];
  return storageId && storageId !== "new" ? storageId : null;
}
