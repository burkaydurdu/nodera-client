export interface CardVerificationCompleteCardProps {
  /** `?verification=` of the return URL; null when the provider sent the browser back without it. */
  verificationId: string | null;
  /** Every query parameter of the return URL, handed to the service verbatim. */
  callback: Record<string, string>;
}
