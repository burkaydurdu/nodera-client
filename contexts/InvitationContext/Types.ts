import type { Invitation } from "@/core/invitation";
import type { Team } from "@/core/team";

export interface InvitationContextValues {
  /** Pending Invitations addressed to the signed-in user's email; empty until loaded. */
  invitations: Invitation[];
  isLoading: boolean;
  reload: () => Promise<void>;
  /** Accepts by id, selects the joined Team and drops the Invitation from the list. */
  accept: (invitation: Invitation) => Promise<Team>;
  decline: (invitation: Invitation) => Promise<void>;
  /** Removes an Invitation answered elsewhere (e.g. the accept page) from the list. */
  forget: (invitationId: string) => void;
}
