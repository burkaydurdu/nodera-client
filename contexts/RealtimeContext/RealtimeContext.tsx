"use client";

import { createContext, ReactNode, useCallback, useEffect, useMemo, useRef } from "react";
import { renewSession } from "@/api/client";
import { RealtimeConnection, realtimeUrl } from "@/api/realtime";
import type { RealtimeEnvelope, RealtimeHandler, RealtimeMessageType } from "@/core/realtime";
import { getAccessToken, subscribeAccessToken } from "@/core/storage";
import useAuth from "../AuthContext/useAuth";
import type { RealtimeContextValues } from "./Types";

type AnyHandler = (data: unknown, at: string) => void;

const RealtimeContext = createContext<RealtimeContextValues>({
  subscribe: () => () => {},
  onResync: () => () => {},
});

/**
 * One realtime socket per tab while a user is signed in, closed on sign-out and replaced when
 * the user changes. Consumers never see the socket: they register handlers here, and the one
 * dispatcher fans each message out, so a reconnect never duplicates a listener.
 */
export const RealtimeProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useAuth();
  const handlers = useRef(new Map<string, Set<AnyHandler>>());
  const resyncHandlers = useRef(new Set<() => void>());

  const dispatch = useCallback((message: RealtimeEnvelope) => {
    const at = message.at ?? new Date().toISOString();
    handlers.current.get(message.type)?.forEach((handler) => handler(message.data, at));
  }, []);

  const resync = useCallback(() => {
    resyncHandlers.current.forEach((handler) => handler());
  }, []);

  const subscribe = useCallback(
    <T extends RealtimeMessageType>(type: T, handler: RealtimeHandler<T>) => {
      const registered = handler as AnyHandler;
      let set = handlers.current.get(type);
      if (!set) {
        set = new Set();
        handlers.current.set(type, set);
      }
      set.add(registered);
      return () => {
        handlers.current.get(type)?.delete(registered);
      };
    },
    []
  );

  const onResync = useCallback((handler: () => void) => {
    resyncHandlers.current.add(handler);
    return () => {
      resyncHandlers.current.delete(handler);
    };
  }, []);

  const userId = currentUser?.id ?? null;
  useEffect(() => {
    if (!userId) return;
    const connection = new RealtimeConnection({
      url: realtimeUrl(),
      getToken: getAccessToken,
      renewSession,
      onMessage: dispatch,
      onResumed: resync,
    });
    connection.start();

    const unsubscribeToken = subscribeAccessToken((token) => connection.tokenChanged(token));
    const onVisibility = () => {
      if (document.visibilityState !== "visible") return;
      connection.wake();
      resync();
    };
    const onOnline = () => connection.wake();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("online", onOnline);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("online", onOnline);
      unsubscribeToken();
      connection.stop();
    };
  }, [userId, dispatch, resync]);

  const value = useMemo<RealtimeContextValues>(
    () => ({ subscribe, onResync }),
    [subscribe, onResync]
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
};

export default RealtimeContext;
