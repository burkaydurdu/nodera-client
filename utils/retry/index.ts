export interface RetryOptions {
  /** Retry while this returns true for the thrown error. */
  shouldRetry: (error: unknown) => boolean;
  /** Give up (rethrow the last error) once this much time has passed. */
  timeoutMs: number;
  intervalMs: number;
  /** Aborts the wait between attempts; the last error is rethrown at once. */
  signal?: AbortSignal;
}

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve) => {
    const timer = setTimeout(done, ms);
    function done() {
      signal?.removeEventListener("abort", done);
      clearTimeout(timer);
      resolve();
    }
    signal?.addEventListener("abort", done, { once: true });
  });

/**
 * Runs `operation` until it succeeds or the window closes. Used for the eventually consistent
 * Project access read model: a Project created a moment ago answers "not found" briefly.
 */
export async function retryUntil<T>(
  operation: () => Promise<T>,
  { shouldRetry, timeoutMs, intervalMs, signal }: RetryOptions
): Promise<T> {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    try {
      return await operation();
    } catch (error) {
      const remaining = deadline - Date.now();
      if (!shouldRetry(error) || remaining <= 0 || signal?.aborted) throw error;
      await sleep(Math.min(intervalMs, remaining), signal);
      if (signal?.aborted) throw error;
    }
  }
}
