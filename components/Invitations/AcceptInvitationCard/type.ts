export interface AcceptInvitationCardProps {
  /** Token from the email link (`/invitations/accept?token=`); null when the link is incomplete. */
  token: string | null;
}
