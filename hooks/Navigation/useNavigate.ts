"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

export const useNavigate = () => {
  const router = useRouter();

  // Stable so effects that redirect can list it as a dependency without re-running.
  const navigate = useCallback(
    (path: string, options?: { replace?: boolean }) => {
      if (options?.replace) {
        router.replace(path);
      } else {
        router.push(path);
      }
    },
    [router]
  );

  return { navigate };
};
