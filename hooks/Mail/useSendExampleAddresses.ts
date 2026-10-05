"use client";

import { useEffect, useState } from "react";
import { ListSendingDomains } from "@/api/mail";
import useAuth from "@/contexts/AuthContext/useAuth";

/** Stands in for a domain the Project has yet to verify. */
const PLACEHOLDER_DOMAIN = "your-domain.com";

export interface SendExampleAddresses {
  /** On the Project's first verified Sending domain, else on a placeholder domain. */
  from: string;
  /** The signed-in user, so the test reaches someone who is looking. */
  to: string;
  /** The list answered with no verified Sending domain: the From must be changed to send. */
  needsDomain: boolean;
}

/** The addresses a send example is filled with, so it runs as copied once a domain is verified. */
export const useSendExampleAddresses = (projectId: string): SendExampleAddresses => {
  const { currentUser } = useAuth();
  // undefined while the list is read, null when it holds no verified domain.
  const [domain, setDomain] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    let current = true;
    setDomain(undefined);
    ListSendingDomains(projectId)
      .then((response) => {
        const verified = (response.data ?? []).find((item) => item.status === "verified");
        if (current) setDomain(verified?.name ?? null);
      })
      .catch(() => {
        // Without the list the example keeps its placeholder; the hint stays hidden.
      });
    return () => {
      current = false;
    };
  }, [projectId]);

  return {
    from: `test@${domain ?? PLACEHOLDER_DOMAIN}`,
    to: currentUser?.email ?? `you@${PLACEHOLDER_DOMAIN}`,
    needsDomain: domain === null,
  };
};
