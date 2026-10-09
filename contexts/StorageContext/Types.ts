import type { SetStateAction } from "react";
import type { Storage } from "@/core/storageApp";

export interface StorageContextValues {
  /** The Storage the pages under it show, as last read or as the service answered a change. */
  storage: Storage;
  /** Reads the Storage again quietly: after a push, or a change made on a page. */
  refresh: () => void;
  /** Shows what the service answered to a change. */
  setStorage: (update: SetStateAction<Storage | null>) => void;
}
