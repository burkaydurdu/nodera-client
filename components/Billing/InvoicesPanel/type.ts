export interface InvoicesPanelProps {
  teamId: string;
  /** `billing.write`: Pay now in the detail. */
  canWrite: boolean;
  /** The invoice open in the detail drawer (`?invoice=`), null when none. */
  openInvoiceId: string | null;
  /** Opens (id) or closes (null) the detail; the page keeps it in the URL. */
  onOpenInvoice: (invoiceId: string | null) => void;
}
