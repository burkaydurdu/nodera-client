"use client";

import { useEffect, useRef } from "react";
import type { RealtimeHandler, RealtimeMessageType } from "@/core/realtime";
import useRealtime from "@/contexts/RealtimeContext/useRealtime";

/**
 * Runs `handler` for every pushed message of one type while the component is mounted. The
 * latest callback is always used, so an inline function never re-registers.
 */
export const useRealtimeMessage = <T extends RealtimeMessageType>(
  type: T,
  handler: RealtimeHandler<T>
): void => {
  const { subscribe } = useRealtime();
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(
    () => subscribe(type, (data, at) => handlerRef.current(data, at)),
    [subscribe, type]
  );
};
