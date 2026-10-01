"use client";

import { createContext, ReactNode, useCallback, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { Logout, LogoutAll } from "@/api/auth";
import { GetMe } from "@/api/users";
import type { Session } from "@/core/session";
import type { User } from "@/core/user";
import {
  clearLastProjectId,
  clearLastTeamId,
  clearMfaChallenge,
  clearPendingInvitation,
  clearSession,
  getAccessToken,
  storeSession,
} from "@/core/storage";
import type { AuthContextValues, LogoutOptions } from "./Types";

const AuthContext = createContext<AuthContextValues>({
  currentUser: null,
  isLoading: true,
  setSession: () => Promise.resolve(null),
  logout: () => Promise.resolve(),
  refreshUser: () => Promise.resolve(null),
  setCurrentUser: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async (): Promise<User | null> => {
    if (!getAccessToken()) {
      setCurrentUserState(null);
      return null;
    }
    try {
      const response = await GetMe();
      setCurrentUserState(response.data);
      return response.data;
    } catch (error) {
      // A 401 is handled by the API client (refresh, then redirect). A network blip or a
      // 5xx must not sign a valid session out: an already-loaded user stays; on the first
      // load the tokens are dropped so the sign-in form never carries a stale bearer.
      if (isAxiosError(error) && error.response?.status === 401) {
        setCurrentUserState(null);
        return null;
      }
      let previous: User | null = null;
      setCurrentUserState((current) => {
        previous = current;
        return current;
      });
      if (!previous) {
        clearSession();
        clearMfaChallenge();
      }
      return previous;
    }
  }, []);

  const setSession = useCallback(
    async (session: Session): Promise<User | null> => {
      storeSession(session);
      clearMfaChallenge();
      return refreshUser();
    },
    [refreshUser]
  );

  const logout = useCallback(async (options?: LogoutOptions): Promise<void> => {
    if (!options?.silent && getAccessToken()) {
      try {
        if (options?.everywhere) {
          await LogoutAll();
        } else {
          await Logout();
        }
      } catch {
        // The local session is cleared regardless of the server answer.
      }
    }
    clearSession();
    clearMfaChallenge();
    clearLastTeamId();
    clearLastProjectId();
    if (!options?.keepInvitation) clearPendingInvitation();
    setCurrentUserState(null);
  }, []);

  const setCurrentUser = useCallback((user: User) => {
    setCurrentUserState(user);
  }, []);

  useEffect(() => {
    let cancelled = false;
    refreshUser().finally(() => {
      if (!cancelled) setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [refreshUser]);

  const value: AuthContextValues = {
    currentUser,
    isLoading,
    setSession,
    logout,
    refreshUser,
    setCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
