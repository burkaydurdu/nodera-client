"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GetBillingStatus } from "@/api/billing";
import { BILLING_STATUS_CHANGED_EVENT, type BillingStatus } from "@/core/billing";
import { useCan } from "@/hooks/Authz/useCan";
import { useRealtimeMessage } from "@/hooks/Realtime/useRealtimeMessage";
import { useResync } from "@/hooks/Realtime/useResync";

export interface BillingStatusState {
  /** The Team's Billing status; null before the first read or without a selected Team. */
  status: BillingStatus | null;
  isLoading: boolean;
  reload: () => void;
}

/**
 * The Team's Billing status, read when the Team is selected and again whenever it may have
 * moved: the service pushes a change, a card or a payment changed in this tab, or the realtime
 * layer resyncs (a reconnect, the tab back in view). Any member may read it (`team.read`): a
 * developer blocked by a missing card or a suspension must learn why and whom to ask.
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

  const reload = useCallback(() => {
    load().catch(() => {
      // The banner is a convenience; a failed read keeps the last answer until the next nudge.
    });
  }, [load]);

  useEffect(() => {
    setStatus(null);
    if (!enabled) return;
    let cancelled = false;
    setIsLoading(true);
    load()
      .catch(() => {
        // A failed first read keeps the banner hidden until the next nudge.
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [load, enabled]);

  useEffect(() => {
    if (!enabled) return;
    window.addEventListener(BILLING_STATUS_CHANGED_EVENT, reload);
    return () => window.removeEventListener(BILLING_STATUS_CHANGED_EVENT, reload);
  }, [reload, enabled]);

  useRealtimeMessage("billing.status_changed", (change) => {
    if (enabled && change.teamId === teamId) reload();
  });

  useResync(() => {
    if (enabled) reload();
  });

  return { status, isLoading, reload };
};
