"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ListInvoices, ListPaymentMethods } from "@/api/billing";
import type { Invoice, InvoiceSummary, PaymentMethod } from "@/core/billing";
import { useInvoicePdfDownload } from "@/hooks/Billing/useInvoicePdfDownload";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import InvoiceDetailDrawer from "@/components/Billing/InvoiceDetailDrawer";
import InvoiceTable from "@/components/Billing/InvoiceTable";
import Card from "@/components/Card";
import EmptyBox from "@/components/EmptyBox";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import type { InvoicesPanelProps } from "./type";

/** The Invoices tab: every invoice of the Team and the detail drawer with PDF and Pay now. */
export default function InvoicesPanel({
  teamId,
  canWrite,
  openInvoiceId,
  onOpenInvoice,
}: InvoicesPanelProps) {
  const t = useTranslations("billing.invoices");
  const { getErrorMessage } = useErrorMessage();
  const { downloadingId, download } = useInvoicePdfDownload(teamId);

  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // The cards only matter for Pay now; a Role that cannot pay never asks for them.
      const [invoicesResponse, methodsResponse] = await Promise.all([
        ListInvoices(teamId),
        canWrite ? ListPaymentMethods(teamId) : Promise.resolve(null),
      ]);
      setInvoices(invoicesResponse.data ?? []);
      setPaymentMethods(methodsResponse?.data ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [teamId, canWrite, getErrorMessage]);

  useEffect(() => {
    load();
  }, [load]);

  const handleChanged = (invoice: Invoice) => {
    setInvoices((list) =>
      list.map((item) => (item.id === invoice.id ? { ...item, ...invoice } : item))
    );
  };

  return (
    <>
      <Card title={t("title")} description={t("description")} flush>
        {error ? (
          <div className="flex flex-col items-start gap-3 px-6 pb-6">
            <NoderaAlert variant="error" message={error} className="w-full" />
            <NoderaButton variant="outlined" size="small" onClick={load}>
              {t("retry")}
            </NoderaButton>
          </div>
        ) : !loading && invoices.length === 0 ? (
          <div className="px-6 pb-8">
            <EmptyBox title={t("emptyTitle")} description={t("emptyDescription")} />
          </div>
        ) : (
          <InvoiceTable
            invoices={invoices}
            loading={loading}
            onOpen={(invoice) => onOpenInvoice(invoice.id)}
            onDownload={download}
            downloadingId={downloadingId}
          />
        )}
      </Card>
      <InvoiceDetailDrawer
        teamId={teamId}
        invoiceId={openInvoiceId}
        canWrite={canWrite}
        paymentMethods={paymentMethods}
        onClose={() => onOpenInvoice(null)}
        onChanged={handleChanged}
      />
    </>
  );
}
