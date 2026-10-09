import type { Storage, StoragePackage, StorageRegion } from "@/core/storageApp";

export interface OpenStorageFormProps {
  projectId: string;
  regions: StorageRegion[];
  /** Smallest first. */
  packages: StoragePackage[];
  onOpened: (storage: Storage) => void;
  onCancel: () => void;
}
