import type { Storage } from "@/core/storageApp";

export interface ConnectionDetailsCardProps {
  storage: Storage;
  /** Where the Access keys are made; null when the Role cannot see them. */
  accessKeysPath: string | null;
}
