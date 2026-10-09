import type { Storage } from "@/core/storageApp";

export interface StorageTableProps {
  storages: Storage[];
  onOpen: (storage: Storage) => void;
}
