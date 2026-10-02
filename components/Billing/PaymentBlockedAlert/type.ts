/** Why the droplet service refused: 402 "payment method required" or 423 "team suspended". */
export type PaymentBlockedReason = "paymentMethodRequired" | "suspended";

export interface PaymentBlockedAlertProps {
  reason: PaymentBlockedReason;
}
