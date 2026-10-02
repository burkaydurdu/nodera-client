import type { InvoiceSummary, PaymentMethod } from "@/core/billing";
import type { PaymentHandler } from "../type";

export interface PayInvoiceModalProps {
  open: boolean;
  teamId: string;
  invoice: InvoiceSummary;
  /** The Team's saved cards; the default one is charged unless another is picked. */
  paymentMethods: PaymentMethod[];
  onClose: () => void;
  /** The accepted Payment; the caller decides what each status means for the invoice. */
  onPaid: PaymentHandler;
}
