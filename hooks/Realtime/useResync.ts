"use client";

import { useEffect, useRef } from "react";
import useRealtime from "@/contexts/RealtimeContext/useRealtime";

/**
 * Runs `refetch` whenever what the component shows may have missed a push: the socket is ready
 * again after a gap, or the tab is visible again. The latest callback is always used.
 */
export const useResync = (refetch: () => void): void => {
  const { onResync } = useRealtime();
  const refetchRef = useRef(refetch);

  useEffect(() => {
    refetchRef.current = refetch;
  }, [refetch]);

  useEffect(() => onResync(() => refetchRef.current()), [onResync]);
};
