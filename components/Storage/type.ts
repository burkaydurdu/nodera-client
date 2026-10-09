import type { AccessKey, CreatedAccessKey, Storage } from "@/core/storageApp";

/** Shared by the Storage feature components. */
export interface StorageOpenedHandler {
  (storage: Storage): void;
}

export interface AccessKeyCreatedHandler {
  (accessKey: CreatedAccessKey): void;
}

export interface AccessKeyRevokeHandler {
  (accessKey: AccessKey): void;
}
