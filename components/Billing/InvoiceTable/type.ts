import type { InvoiceSummary } from "@/core/billing";
import type { InvoiceSummaryHandler } from "../type";

export interface InvoiceTableProps {
  invoices: InvoiceSummary[];
  loading?: boolean;
  onOpen: InvoiceSummaryHandler;
  /** Saves the invoice's PDF without opening the detail. */
  onDownload: InvoiceSummaryHandler;
  /** Id of the invoice whose PDF is being fetched. */
  downloadingId?: string | null;
}
