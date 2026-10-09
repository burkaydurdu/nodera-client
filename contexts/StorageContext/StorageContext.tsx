"use client";

import { createContext, ReactNode, type SetStateAction, useMemo } from "react";
import type { Storage } from "@/core/storageApp";
import type { StorageContextValues } from "./Types";

const StorageContext = createContext<StorageContextValues | null>(null);

/**
 * Hands the pages of one Storage (Files, Access keys, Usage, Settings) the Storage its shell
 * read, with the banners and tabs already drawn, so a page never reads it a second time.
 */
export const StorageProvider = ({
  storage,
  refresh,
  setStorage,
  children,
}: {
  storage: Storage;
  refresh: () => void;
  setStorage: (update: SetStateAction<Storage | null>) => void;
  children: ReactNode;
}) => {
  const value = useMemo<StorageContextValues>(
    () => ({ storage, refresh, setStorage }),
    [storage, refresh, setStorage]
  );
  return <StorageContext.Provider value={value}>{children}</StorageContext.Provider>;
};

export default StorageContext;
