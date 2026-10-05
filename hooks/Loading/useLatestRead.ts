"use client";

import { type SetStateAction, useCallback, useEffect, useRef, useState } from "react";

export interface LatestReadState<T> {
  /** The last good read, or what the service answered to a change since; `initial` before. */
  data: T;
  /** The first read of the current key is running, or running again after `reload`. */
  isLoading: boolean;
  /** Why the first read failed, for the caller to word or to branch on its code; else null. */
  error: unknown;
  /** Reads again as the first time: the spinner, then the data or the error. */
  reload: () => void;
  /** Reads again quietly (a push, a resync) once the first read landed; a failure changes nothing. */
  refresh: () => void;
  /** Shows what the service answered to a change; a read still in flight is dropped. */
  setData: (update: SetStateAction<T>) => void;
}

/**
 * One resource read for `key` (a Project, a Sending domain), and read afresh when the key
 * changes. Only the newest read may land, so a push answered after a newer read, or a read
 * answered after a confirmed change, never rolls the screen back. The first read of a key gets
 * a signal that a key change or leaving the page aborts. The latest `read` is always used.
 */
export const useLatestRead = <T>(
  read: (first: boolean, signal?: AbortSignal) => Promise<T>,
  key: string,
  initial: T
): LatestReadState<T> => {
  const readRef = useRef(read);
  const initialRef = useRef(initial);
  const [data, setDataState] = useState<T>(initial);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  // The newest read or confirmed change: only it may write the data.
  const ticket = useRef(0);
  // The newest first read: only it may end the spinner, even when a change overtook it.
  const firstTicket = useRef(0);
  // Something of the current key is on screen for a quiet read to keep or replace.
  const settled = useRef(false);

  useEffect(() => {
    readRef.current = read;
  }, [read]);

  const run = useCallback(async (first: boolean, signal?: AbortSignal) => {
    const mine = ++ticket.current;
    if (first) {
      firstTicket.current = mine;
      settled.current = false;
      setIsLoading(true);
      setError(null);
    }
    try {
      const next = await readRef.current(first, signal);
      if (mine !== ticket.current || signal?.aborted) return;
      setDataState(next);
      settled.current = true;
    } catch (err) {
      if (first && mine === ticket.current && !signal?.aborted) setError(err);
    } finally {
      if (first && mine === firstTicket.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setDataState(initialRef.current);
    void run(true, controller.signal);
    return () => controller.abort();
  }, [key, run]);

  const reload = useCallback(() => void run(true), [run]);

  const refresh = useCallback(() => {
    if (settled.current) void run(false);
  }, [run]);

  const setData = useCallback((update: SetStateAction<T>) => {
    ticket.current += 1;
    settled.current = true;
    setDataState(update);
  }, []);

  return { data, isLoading, error, reload, refresh, setData };
};
