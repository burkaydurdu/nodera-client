export interface VerifyEmailCardProps {
  /** Pre-filled address from the query string; stays editable. */
  initialEmail?: string;
  /** A code was just sent (arriving from sign-up): start the resend cooldown immediately. */
  codeJustSent?: boolean;
}
