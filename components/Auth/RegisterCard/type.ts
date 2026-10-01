export interface RegisterCardProps {
  /** Token from an invitation link (`/register?invitation=`); the sign-up joins that Team. */
  invitationToken?: string | null;
}
