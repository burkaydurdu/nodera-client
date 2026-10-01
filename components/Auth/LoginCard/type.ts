export interface LoginCardProps {
  /** Token from an invitation link (`/login?invitation=`); sign-in continues on the accept page. */
  invitationToken?: string | null;
}
