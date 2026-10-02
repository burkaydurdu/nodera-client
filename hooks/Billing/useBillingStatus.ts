"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GetBillingStatus } from "@/api/billing";
import {
  BILLING_STATUS_CHANGED_EVENT,
  BILLING_STATUS_POLL_INTERVAL_MS,
  type BillingStatus,
} from "@/core/billing";
import { useCan } from "@/hooks/Authz/useCan";
import { usePolling } from "@/hooks/Polling/usePolling";

export interface BillingStatusState {
  /** The Team's Billing status; null before the first read or without a selected Team. */
  status: BillingStatus | null;
  isLoading: boolean;
  reload: () => void;
}

/**
 * The Team's Billing status, polled every minute while a dashboard page is open and refreshed
 * at once when a card or a payment changed here or the tab comes back into view. Any member
 * may read it (`team.read`): a developer blocked by a missing card or a suspension must learn
 * why and whom to ask.
 */
export const useBillingStatus = (teamId: string | null): BillingStatusState => {
  const canRead = useCan("team.read");
  const enabled = !!teamId && canRead;
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // The Team the hook currently serves: an answer for a Team switched away from is dropped
  // instead of painting another Team's banner.
  const currentTeam = useRef(teamId);

  useEffect(() => {
    currentTeam.current = teamId;
  }, [teamId]);

  const load = useCallback(async () => {
    if (!teamId || !canRead) return;
    const response = await GetBillingStatus(teamId);
    if (currentTeam.current !== teamId) return;
    setStatus(response.data ?? null);
  }, [teamId, canRead]);

  useEffect(() => {
    setStatus(null);
    if (!enabled) return;
    let cancelled = false;
    setIsLoading(true);
    load()
      .catch(() => {
        // The banner is a convenience; a failed read keeps it hidden until the next poll.
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [load, enabled]);

  const polling = usePolling(load, BILLING_STATUS_POLL_INTERVAL_MS, enabled);
  const { retry } = polling;

  // `retry` also clears a stalled poller, so a change here or a returning tab revives it.
  useEffect(() => {
    if (!enabled) return;
    const onChanged = () => retry();
    const onVisibility = () => {
      if (document.visibilityState === "visible") retry();
    };
    window.addEventListener(BILLING_STATUS_CHANGED_EVENT, onChanged);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener(BILLING_STATUS_CHANGED_EVENT, onChanged);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [retry, enabled]);

  return { status, isLoading, reload: retry };
};
