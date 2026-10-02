import type { ThreeDSResult } from "@/core/billing";

export interface PaymentConfirmationCardProps {
  /** From the email link or the bank's return (`/billing/confirm?payment=`); null when missing. */
  paymentId: string | null;
  /** The email link's token; absent on the bank's return, where the stashed one is used. */
  token: string | null;
  /** Set when the bank sent the browser back (`&result=succeeded|failed`). */
  result: ThreeDSResult | null;
}
