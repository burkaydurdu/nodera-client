"use client";

import { createContext, ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import useAuth from "../AuthContext/useAuth";
import Loading from "@/components/Loading";
import { useNavigate } from "@/hooks/Navigation/useNavigate";

type RoutingContextValues = {
  isLoading: boolean;
};

const RoutingContext = createContext<RoutingContextValues>({
  isLoading: true,
});

export const NO_AUTH_PATHS = [
  "/login",
  "/register",
  "/verify-email",
  "/otp",
  "/forgot-password",
  "/reset-password",
];
const ROOT_PATH = "/";
const LOGIN_PATH = "/login";
const DASHBOARD_PATH = "/dashboard";

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
      navigate(currentUser ? DASHBOARD_PATH : LOGIN_PATH, { replace: true });
      return;
    }
    if (currentUser && isPublicPath) {
      navigate(DASHBOARD_PATH, { replace: true });
      return;
    }
    if (!currentUser && !isPublicPath) {
      navigate(LOGIN_PATH, { replace: true });
      return;
    }

    setIsLoading(false);
  }, [currentUser, pathName, authIsLoading]);

  if (isLoading || authIsLoading) {
    return <Loading fullScreen />;
  }

  return <RoutingContext.Provider value={{ isLoading }}>{children}</RoutingContext.Provider>;
};

export default RoutingContext;
