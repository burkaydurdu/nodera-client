import type { Storage } from "@/core/storageApp";

export interface DeleteStorageCardProps {
  storage: Storage;
  deleting: boolean;
  onDelete: () => void;
}
