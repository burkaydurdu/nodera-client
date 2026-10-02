"use client";

import { useCallback, useState } from "react";
import { App } from "antd";
import { DownloadInvoicePdf } from "@/api/billing";
import type { InvoiceSummary } from "@/core/billing";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { filenameFromContentDisposition, saveBlob } from "@/utils/download";

export interface InvoicePdfDownload {
  /** Id of the invoice whose PDF is being fetched, null when none. */
  downloadingId: string | null;
  download: (invoice: Pick<InvoiceSummary, "id" | "number">) => Promise<void>;
}

/** Fetches an invoice PDF with the session and saves it; a failure becomes a toast. */
export const useInvoicePdfDownload = (teamId: string): InvoicePdfDownload => {
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessage();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const download = useCallback(
    async (invoice: Pick<InvoiceSummary, "id" | "number">) => {
      setDownloadingId(invoice.id);
      try {
        const response = await DownloadInvoicePdf(teamId, invoice.id);
        const filename = filenameFromContentDisposition(
          response.headers?.["content-disposition"] as string | undefined,
          `${invoice.number}.pdf`
        );
        saveBlob(response.data, filename);
      } catch (error) {
        message.error(getErrorMessage(error));
      } finally {
        setDownloadingId(null);
      }
    },
    [teamId, message, getErrorMessage]
  );

  return { downloadingId, download };
};
