"use client";

import { createContext, ReactNode, useCallback, useEffect, useState } from "react";
import { AcceptMyInvitation, DeclineMyInvitation, ListMyInvitations } from "@/api/invitations";
import type { Invitation } from "@/core/invitation";
import type { Team } from "@/core/team";
import useAuth from "../AuthContext/useAuth";
import useTeam from "../TeamContext/useTeam";
import type { InvitationContextValues } from "./Types";

const InvitationContext = createContext<InvitationContextValues>({
  invitations: [],
  isLoading: false,
  reload: () => Promise.resolve(),
  accept: () => Promise.reject(new Error("no provider")),
  decline: () => Promise.resolve(),
  forget: () => {},
});

/**
 * The pending Invitations of the signed-in user, loaded once the user is known so the navbar
 * badge is right on first paint and after sign-in. Answering one here keeps the badge and the
 * Team list in step without each page reloading them.
 */
export const InvitationProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useAuth();
  const { addTeam } = useTeam();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await ListMyInvitations();
      setInvitations(response.data ?? []);
    } catch {
      // The badge is a convenience; a failed load keeps the last known list.
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      reload();
      return;
    }
    setInvitations([]);
  }, [currentUser?.id, reload]);

  const forget = useCallback((invitationId: string) => {
    setInvitations((list) => list.filter((item) => item.id !== invitationId));
  }, []);

  const accept = useCallback(
    async (invitation: Invitation): Promise<Team> => {
      const response = await AcceptMyInvitation(invitation.id);
      forget(invitation.id);
      addTeam(response.data.team);
      return response.data.team;
    },
    [addTeam, forget]
  );

  const decline = useCallback(
    async (invitation: Invitation) => {
      await DeclineMyInvitation(invitation.id);
      forget(invitation.id);
    },
    [forget]
  );

  const value: InvitationContextValues = {
    invitations,
    isLoading,
    reload,
    accept,
    decline,
    forget,
  };

  return <InvitationContext.Provider value={value}>{children}</InvitationContext.Provider>;
};

export default InvitationContext;
