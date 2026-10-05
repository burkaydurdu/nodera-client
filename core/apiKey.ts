import type { KeyPermission } from "./authz";

/** An active API key of a Project; the secret itself is never listed. */
export interface ApiKey {
  id: string;
  name: string;
  /** The public part, `nd_<id>`, shown to tell keys apart. */
  prefix: string;
  /** Permission names; a service may add ones this build does not know. */
  permissions: string[];
  /** The creator's user id; the key outlives their membership, so it may name no member. */
  createdBy: string;
  createdAt: string;
  lastUsedAt: string | null;
}

/** The creation answer: the whole key, `nd_<id>.<secret>`, answered this once. */
export interface CreatedApiKey extends ApiKey {
  key: string;
}

export interface CreateApiKeyPayload {
  name: string;
  permissions: KeyPermission[];
}

export const MAX_ACTIVE_API_KEYS = 20;
export const API_KEY_NAME_MAX_LENGTH = 64;
