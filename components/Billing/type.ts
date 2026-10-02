import type {
  BillingProfile,
  Invoice,
  InvoiceSummary,
  Payment,
  PaymentMethod,
} from "@/core/billing";

/** Shared by the billing feature components. */
export interface BillingProfileSavedHandler {
  (profile: BillingProfile): void;
}

export interface PaymentMethodHandler {
  (method: PaymentMethod): void;
}

export interface InvoiceSummaryHandler {
  (invoice: InvoiceSummary): void;
}

export interface InvoiceChangedHandler {
  (invoice: Invoice): void;
}

export interface PaymentHandler {
  (payment: Payment): void;
}
