"use client";

import { useCallback } from "react";
import { DEFAULT_APP, appLandingPath } from "@/core/apps";
import { acceptInvitationPath } from "@/core/invitation";
import { getLastApp, getPendingInvitation } from "@/core/storage";
import { useNavigate } from "@/hooks/Navigation/useNavigate";

/**
 * Where a freshly established session lands. An invitation link that led to sign-in
 * continues on the accept page; one that led to sign-up is accepted server-side on
 * verification and is left in storage so TeamContext can select the Team by name.
 * RoutingContext reaches the same answer from the stored entry, so the two never disagree;
 * the entry is cleared by the accept page itself, once it holds the token.
 */
export const useAfterSignIn = () => {
  const { navigate } = useNavigate();

  return useCallback(() => {
    const pending = getPendingInvitation();
    if (pending && !pending.autoAccepted) {
      navigate(acceptInvitationPath(pending.token), { replace: true });
      return;
    }
    navigate(appLandingPath(getLastApp() ?? DEFAULT_APP), { replace: true });
  }, [navigate]);
};
