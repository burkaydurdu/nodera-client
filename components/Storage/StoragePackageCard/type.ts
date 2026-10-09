import type { Storage, StoragePackageBlock } from "@/core/storageApp";

export interface StoragePackageCardProps {
  storage: Storage;
  /** `storage.write`; without it the scheduled change cannot be undone from here. */
  canWrite: boolean;
  /** Undoing a schedule is a change of Package too, and waits for a card or a paid invoice. */
  blocked: StoragePackageBlock | null;
  busy: boolean;
  onUndo: () => void;
}
