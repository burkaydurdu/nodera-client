"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ListNotifications } from "@/api/notifications";
import {
  NOTIFICATION_PAGE_SIZE,
  type Notification,
  type NotificationPage,
  appendPage,
  applyInboxChange,
  mergeFirstPage,
} from "@/core/notification";
import useInbox from "@/contexts/InboxContext/useInbox";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { useResync } from "@/hooks/Realtime/useResync";

export interface NotificationListOptions {
  pageSize?: number;
  /**
   * Loads the first page each time it turns true and follows resyncs only meanwhile (the bell's
   * panel while open). Live changes apply either way.
   */
  enabled?: boolean;
}

export interface NotificationListState {
  /** Newest first. */
  notifications: Notification[];
  /** The first page is being loaded or refetched. */
  isLoading: boolean;
  isLoadingMore: boolean;
  /** i18n-resolved message when the first page could not be loaded. */
  error: string | null;
  hasMore: boolean;
  reload: () => Promise<void>;
  /** Appends the next older page; rejects with the API error so the caller can say so. */
  loadMore: () => Promise<void>;
}

const EMPTY_PAGE: NotificationPage = { items: [], hasMore: false };

/**
 * A stretch of the user's Inbox, paged by the `before` cursor. REST is the truth on every load
 * and resync; between them, pushes and reads from the Inbox context are applied in place.
 */
export const useNotificationList = ({
  pageSize = NOTIFICATION_PAGE_SIZE,
  enabled = true,
}: NotificationListOptions = {}): NotificationListState => {
  const { subscribe } = useInbox();
  const { getErrorMessage } = useErrorMessage();
  const [page, setPage] = useState<NotificationPage>(EMPTY_PAGE);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Only the newest first-page request may write; an older answer would roll the list back.
  const ticket = useRef(0);

  const reload = useCallback(async () => {
    const mine = ++ticket.current;
    setIsLoading(true);
    setError(null);
    try {
      const response = await ListNotifications({ limit: pageSize });
      if (mine !== ticket.current) return;
      setPage((current) => mergeFirstPage(current, response.data ?? [], pageSize));
    } catch (err) {
      if (mine === ticket.current) setError(getErrorMessage(err));
    } finally {
      if (mine === ticket.current) setIsLoading(false);
    }
  }, [pageSize, getErrorMessage]);

  const loadMore = useCallback(async () => {
    const oldest = page.items[page.items.length - 1];
    if (!oldest || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const response = await ListNotifications({ before: oldest.id, limit: pageSize });
      setPage((current) => appendPage(current, response.data ?? [], pageSize));
    } finally {
      setIsLoadingMore(false);
    }
  }, [page.items, isLoadingMore, pageSize]);

  // `reload` changes with the translator; listing it would refetch on a language switch.
  useEffect(() => {
    if (enabled) void reload();
  }, [enabled]);

  useEffect(
    () =>
      subscribe((change) =>
        setPage((current) => ({ ...current, items: applyInboxChange(current.items, change) }))
      ),
    [subscribe]
  );

  useResync(() => {
    if (enabled) void reload();
  });

  return {
    notifications: page.items,
    isLoading,
    isLoadingMore,
    error,
    hasMore: page.hasMore,
    reload,
    loadMore,
  };
};
