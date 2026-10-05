"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { App } from "antd";
import type { CursorPage } from "@/core/paging";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";

export interface CursorListState<T> {
  items: T[];
  /** The first page is being loaded, for the current query. */
  isLoading: boolean;
  isLoadingMore: boolean;
  /** The first page's error, in the user's language. */
  error: string | null;
  hasMore: boolean;
  reload: () => Promise<void>;
  /** Appends the next page; a failure is told in a toast and the list stays as it is. */
  loadMore: () => Promise<void>;
  /** Drops items in place, after a delete the service confirmed. */
  remove: (predicate: (item: T) => boolean) => void;
}

/**
 * A cursor-paged list, loaded afresh whenever `queryKey` changes (a filter, a search) while
 * `enabled`. Only the newest first-page request may write: the answer to a query already
 * replaced is dropped, and a next page fetched across a reload is too. The latest callback is
 * always used.
 */
export const useCursorList = <T extends { id: string }>(
  fetchPage: (cursor: string | null) => Promise<CursorPage<T>>,
  queryKey: string,
  enabled: boolean = true
): CursorListState<T> => {
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessage();
  const fetchRef = useRef(fetchPage);
  const [items, setItems] = useState<T[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const ticket = useRef(0);

  useEffect(() => {
    fetchRef.current = fetchPage;
  }, [fetchPage]);

  const reload = useCallback(async () => {
    const mine = ++ticket.current;
    setIsLoading(true);
    setError(null);
    try {
      const page = await fetchRef.current(null);
      if (mine !== ticket.current) return;
      setItems(page.items ?? []);
      setCursor(page.nextCursor ?? null);
    } catch (err) {
      if (mine === ticket.current) setError(err);
    } finally {
      if (mine === ticket.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      // Whatever an earlier query would still answer is dropped with it.
      ticket.current += 1;
      setItems([]);
      setCursor(null);
      setError(null);
      setIsLoading(false);
      return;
    }
    void reload();
  }, [queryKey, enabled, reload]);

  const loadMore = useCallback(async () => {
    if (!cursor || isLoadingMore) return;
    const mine = ticket.current;
    setIsLoadingMore(true);
    try {
      const page = await fetchRef.current(cursor);
      if (mine !== ticket.current) return;
      setItems((current) => {
        const shown = new Set(current.map((item) => item.id));
        return [...current, ...(page.items ?? []).filter((item) => !shown.has(item.id))];
      });
      setCursor(page.nextCursor ?? null);
    } catch (err) {
      if (mine === ticket.current) message.error(getErrorMessage(err));
    } finally {
      setIsLoadingMore(false);
    }
  }, [cursor, isLoadingMore, message, getErrorMessage]);

  const remove = useCallback((predicate: (item: T) => boolean) => {
    setItems((current) => current.filter((item) => !predicate(item)));
  }, []);

  return {
    items,
    isLoading,
    isLoadingMore,
    error: error === null ? null : getErrorMessage(error),
    hasMore: !!cursor,
    reload,
    loadMore,
    remove,
  };
};
