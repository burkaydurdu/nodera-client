export interface PaymentMethodsPanelProps {
  teamId: string;
  /** `billing.write`: add, make default and delete. */
  canWrite: boolean;
  /** Adding a card needs a Billing profile first (409); this takes the user to that tab. */
  onOpenProfile: () => void;
}
