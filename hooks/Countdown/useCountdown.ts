import { useCallback, useEffect, useState } from "react";

/** Second-precision countdown; `start(n)` (re)arms it, `seconds` reaches 0 and stays there. */
export const useCountdown = (initialSeconds: number = 0) => {
  const [seconds, setSeconds] = useState(Math.max(0, Math.floor(initialSeconds)));

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  const start = useCallback((value: number) => {
    setSeconds(Math.max(0, Math.ceil(value)));
  }, []);

  const reset = useCallback(() => setSeconds(0), []);

  return { seconds, active: seconds > 0, start, reset };
};
