import type { Storage } from "@/core/storageApp";

export interface StorageStateAlertProps {
  storage: Storage;
  /** `storage.write`: a full Storage offers the way to its Package settings. */
  canWrite: boolean;
}
