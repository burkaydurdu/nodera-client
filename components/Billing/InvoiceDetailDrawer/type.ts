import type { PaymentMethod } from "@/core/billing";
import type { InvoiceChangedHandler } from "../type";

export interface InvoiceDetailDrawerProps {
  teamId: string;
  /** The invoice to show; null closes the drawer. */
  invoiceId: string | null;
  /** `billing.write`: Pay now. */
  canWrite: boolean;
  /** The Team's cards for the Pay now picker (empty when the Role cannot pay). */
  paymentMethods: PaymentMethod[];
  onClose: () => void;
  /** Fired with the fresh invoice after a payment, so the list stays in step. */
  onChanged: InvoiceChangedHandler;
}
