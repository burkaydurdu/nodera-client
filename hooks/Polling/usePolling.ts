import { useCallback, useEffect, useRef, useState } from "react";

/** Consecutive rejected ticks after which polling stops until the caller retries. */
export const MAX_POLL_FAILURES = 3;

export interface PollingState {
  /** True once MAX_POLL_FAILURES ticks in a row rejected; the timer is stopped meanwhile. */
  stalled: boolean;
  /** Clears the failure count and runs one tick at once; polling resumes when it succeeds. */
  retry: () => void;
  /** Runs one tick at once, off the timer (a realtime nudge); it counts like any other tick. */
  refresh: () => void;
}

/**
 * Calls `tick` every `intervalMs` while `enabled`, and at once on `refresh`. The latest callback
 * is always used, so the caller can pass an inline function without restarting the timer on
 * every render. A tick reports failure by rejecting; a run of them backs off so an unreachable
 * service is not hammered and the user learns that the view is no longer live.
 */
export const usePolling = (
  tick: () => void | Promise<void>,
  intervalMs: number,
  enabled: boolean
): PollingState => {
  const tickRef = useRef(tick);
  const running = useRef(false);
  const queued = useRef(false);
  const [failures, setFailures] = useState(0);
  const stalled = failures >= MAX_POLL_FAILURES;

  useEffect(() => {
    tickRef.current = tick;
  }, [tick]);

  // A tick asked for while one runs follows it instead of being dropped: the running one may
  // have read the state before whatever prompted the second.
  const run = useCallback(async () => {
    if (running.current) {
      queued.current = true;
      return;
    }
    running.current = true;
    do {
      queued.current = false;
      try {
        await tickRef.current();
        setFailures(0);
      } catch {
        setFailures((count) => count + 1);
      }
    } while (queued.current);
    running.current = false;
  }, []);

  useEffect(() => {
    if (!enabled || stalled) return;
    const timer = setInterval(() => {
      void run();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [enabled, intervalMs, stalled, run]);

  const retry = useCallback(() => {
    setFailures(0);
    void run();
  }, [run]);

  const refresh = useCallback(() => {
    void run();
  }, [run]);

  return { stalled, retry, refresh };
};
