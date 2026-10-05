"use client";

import { createContext, ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { DEFAULT_APP, appLandingPath } from "@/core/apps";
import { INVITATION_QUERY_PARAM, acceptInvitationPath } from "@/core/invitation";
import { LOGIN_PATH, NO_AUTH_PATHS, OPEN_PATHS, isOpenPath } from "@/core/routes";
import { getLastApp, getPendingInvitation } from "@/core/storage";
import useAuth from "../AuthContext/useAuth";
import Loading from "@/components/Loading";
import { useNavigate } from "@/hooks/Navigation/useNavigate";

type RoutingContextValues = {
  isLoading: boolean;
};

const RoutingContext = createContext<RoutingContextValues>({
  isLoading: true,
});

/** The route lists live in core/routes.ts (the API client needs them too); re-exported here. */
export { NO_AUTH_PATHS, OPEN_PATHS };
const ROOT_PATH = "/";

/**
 * The invitation a signed-in user on a public page should continue with: the link's query
 * parameter, or the one sign-in stashed for the MFA / verification step. Single source of
 * truth for that redirect, so no page-level navigate can race it.
 */
const pendingInvitationToken = (): string | null => {
  const fromQuery = new URLSearchParams(window.location.search).get(INVITATION_QUERY_PARAM);
  if (fromQuery) return fromQuery;
  const pending = getPendingInvitation();
  return pending && !pending.autoAccepted ? pending.token : null;
};

/** A signed-in user lands in the App used last, where they left off. */
const homePath = (): string => appLandingPath(getLastApp() ?? DEFAULT_APP);

/** Client-side guard: public pages for signed-out users, everything else for signed-in ones. */
export const RoutingProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const { navigate } = useNavigate();
  const pathName = usePathname();
  const { currentUser, isLoading: authIsLoading } = useAuth();

  useEffect(() => {
    if (authIsLoading) return;

    const isPublicPath = NO_AUTH_PATHS.includes(pathName);

    if (pathName === ROOT_PATH) {
      navigate(currentUser ? homePath() : LOGIN_PATH, { replace: true });
      return;
    }
    if (isOpenPath(pathName)) {
      setIsLoading(false);
      return;
    }
    if (currentUser && isPublicPath) {
      const invitation = pendingInvitationToken();
      navigate(invitation ? acceptInvitationPath(invitation) : homePath(), {
        replace: true,
      });
      return;
    }
    if (!currentUser && !isPublicPath) {
      navigate(LOGIN_PATH, { replace: true });
      return;
    }

    setIsLoading(false);
  }, [currentUser, pathName, authIsLoading, navigate]);

  if (isLoading || authIsLoading) {
    return <Loading fullScreen />;
  }

  return <RoutingContext.Provider value={{ isLoading }}>{children}</RoutingContext.Provider>;
};

export default RoutingContext;
