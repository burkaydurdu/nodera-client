"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ListObjects } from "@/api/storage";
import type { StorageObject } from "@/core/storageApp";

export interface ObjectListingState {
  folders: string[];
  objects: StorageObject[];
  /** The first page of the current folder is being loaded. */
  isLoading: boolean;
  isLoadingMore: boolean;
  /** Why the first page failed, for the caller to word; else null. */
  error: unknown;
  hasMore: boolean;
  reload: () => void;
  /** Reads the first page again quietly; a failure changes nothing. */
  refresh: () => void;
  /** Appends the next page; a failure is handed back for a toast and the list stays as it is. */
  loadMore: () => Promise<unknown>;
  /** Drops objects in place, after a delete the service confirmed. */
  removeKeys: (keys: readonly string[]) => void;
}

/**
 * One folder of a Storage, 200 entries a page, read afresh whenever the folder (or the
 * Storage) changes. Only the newest first-page read may land, so a slow answer for a folder
 * already left never overwrites the one on screen; a next page fetched across a reload is
 * dropped too.
 */
export const useObjectListing = (
  projectId: string,
  storageId: string,
  prefix: string
): ObjectListingState => {
  const [folders, setFolders] = useState<string[]>([]);
  const [objects, setObjects] = useState<StorageObject[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const ticket = useRef(0);
  const settled = useRef(false);

  const readFirst = useCallback(
    async (quiet: boolean) => {
      const mine = ++ticket.current;
      if (!quiet) {
        settled.current = false;
        setIsLoading(true);
        setError(null);
      }
      try {
        const response = await ListObjects(projectId, storageId, {
          prefix: prefix || undefined,
        });
        if (mine !== ticket.current) return;
        setFolders(response.data.folders ?? []);
        setObjects(response.data.objects ?? []);
        setCursor(response.data.nextCursor ?? null);
        settled.current = true;
      } catch (err) {
        if (!quiet && mine === ticket.current) setError(err);
      } finally {
        if (!quiet && mine === ticket.current) setIsLoading(false);
      }
    },
    [projectId, storageId, prefix]
  );

  useEffect(() => {
    setFolders([]);
    setObjects([]);
    setCursor(null);
    void readFirst(false);
  }, [readFirst]);

  const reload = useCallback(() => void readFirst(false), [readFirst]);

  const refresh = useCallback(() => {
    if (settled.current) void readFirst(true);
  }, [readFirst]);

  const loadMore = useCallback(async () => {
    if (!cursor || isLoadingMore) return;
    const mine = ticket.current;
    setIsLoadingMore(true);
    try {
      const response = await ListObjects(projectId, storageId, {
        prefix: prefix || undefined,
        cursor,
      });
      if (mine !== ticket.current) return;
      setFolders((list) => [...list, ...(response.data.folders ?? [])]);
      setObjects((list) => [...list, ...(response.data.objects ?? [])]);
      setCursor(response.data.nextCursor ?? null);
    } catch (err) {
      if (mine === ticket.current) return err;
    } finally {
      if (mine === ticket.current) setIsLoadingMore(false);
    }
  }, [projectId, storageId, prefix, cursor, isLoadingMore]);

  const removeKeys = useCallback((keys: readonly string[]) => {
    const gone = new Set(keys);
    setObjects((list) => list.filter((object) => !gone.has(object.key)));
  }, []);

  return {
    folders,
    objects,
    isLoading,
    isLoadingMore,
    error,
    hasMore: cursor !== null,
    reload,
    refresh,
    loadMore,
    removeKeys,
  };
};
