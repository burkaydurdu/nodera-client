import type { Invitation } from "@/core/invitation";
import type { InvitationActionHandler, InvitationResendHandler } from "../type";

export interface InvitationTableProps {
  invitations: Invitation[];
  loading?: boolean;
  /** Id of the Invitation whose revoke is in flight. */
  revokingId?: string | null;
  onResend: InvitationResendHandler;
  onRevoke: InvitationActionHandler;
}
