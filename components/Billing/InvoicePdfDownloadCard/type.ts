export interface InvoicePdfDownloadCardProps {
  /** From the email link (`/billing/invoice-pdf?invoice=&expires=&token=`); null when missing. */
  invoiceId: string | null;
  expires: string | null;
  token: string | null;
}
