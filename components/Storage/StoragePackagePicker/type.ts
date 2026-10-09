import type {
  Storage,
  StoragePackage,
  StoragePackageAction,
  StoragePackageBlock,
} from "@/core/storageApp";

export interface StoragePackagePickerProps {
  /** Smallest first. */
  packages: StoragePackage[];
  storage: Storage;
  /** `storage.write`; without it the catalog is shown read-only. */
  canWrite: boolean;
  /** Every change waits for a card or a paid invoice. */
  blocked: StoragePackageBlock | null;
  /** The code whose change is in flight. */
  busyCode: string | null;
  onSelect: (pkg: StoragePackage, action: StoragePackageAction) => void;
}
