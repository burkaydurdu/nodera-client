"use client";

import { useCallback, useEffect, useState } from "react";
import { App, Drawer } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { useLocale, useTranslations } from "next-intl";
import { GetInvoice } from "@/api/billing";
import {
  type Invoice,
  type Payment,
  isInvoicePayable,
  isPaymentOpen,
  latestPayment,
  notifyBillingStatusChanged,
} from "@/core/billing";
import { useFailureReason } from "@/hooks/Billing/useFailureReason";
import { useInvoicePdfDownload } from "@/hooks/Billing/useInvoicePdfDownload";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { formatDateTime, formatPeriodEnd, formatUtcDate } from "@/utils/date";
import InvoiceBreakdown from "@/components/Billing/InvoiceBreakdown";
import InvoicePaymentsList from "@/components/Billing/InvoicePaymentsList";
import InvoiceStatusBadge from "@/components/Billing/InvoiceStatusBadge";
import PayInvoiceModal from "@/components/Billing/PayInvoiceModal";
import FormSection from "@/components/FormSection";
import Loading from "@/components/Loading";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import type { InvoiceDetailDrawerProps } from "./type";

export default function InvoiceDetailDrawer({
  teamId,
  invoiceId,
  canWrite,
  paymentMethods,
  onClose,
  onChanged,
}: InvoiceDetailDrawerProps) {
  const t = useTranslations("billing.invoices");
  const td = useTranslations("billing.invoices.detail");
  const tp = useTranslations("billing.invoices.pay");
  const locale = useLocale();
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessage();
  const { describeFailureReason } = useFailureReason();
  const { downloadingId, download } = useInvoicePdfDownload(teamId);

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payOpen, setPayOpen] = useState(false);

  const load = useCallback(async () => {
    if (!invoiceId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await GetInvoice(teamId, invoiceId);
      setInvoice(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [teamId, invoiceId, getErrorMessage]);

  useEffect(() => {
    setInvoice(null);
    setPayOpen(false);
    load();
  }, [load]);

  const handlePaid = async (payment: Payment) => {
    setPayOpen(false);
    switch (payment.status) {
      case "succeeded":
        message.success(tp("succeeded"));
        break;
      case "failed":
        message.error(tp("failed", { reason: describeFailureReason(payment.failureReason) }));
        break;
      case "confirmation_required":
        message.info(tp("checkEmail"));
        break;
      default:
        message.info(tp("pending"));
    }
    notifyBillingStatusChanged();
    // The invoice's status and payments changed on the server; the fresh read is the truth.
    if (!invoiceId) return;
    try {
      const response = await GetInvoice(teamId, invoiceId);
      setInvoice(response.data);
      onChanged(response.data);
    } catch {
      // The drawer keeps the last read; the list refreshes on the next open.
    }
  };

  const latest = latestPayment(invoice?.payments);
  // An attempt still in flight or waiting for the cardholder blocks a second one (33-10007).
  const openAttempt = latest && isPaymentOpen(latest.status) ? latest : null;
  const payable = !!invoice && canWrite && isInvoicePayable(invoice.status) && !openAttempt;

  const openAttemptAlert = openAttempt && (
    <NoderaAlert
      variant="info"
      message={
        openAttempt.status === "pending" ? td("paymentProcessingTitle") : td("awaitingTitle")
      }
      description={
        openAttempt.status === "pending" ? (
          td("paymentProcessing")
        ) : (
          <div className="flex flex-col items-start gap-2">
            <span>{td("awaiting")}</span>
            {openAttempt.confirmationUrl && (
              <a
                href={openAttempt.confirmationUrl}
                className="font-medium text-brand-600 hover:text-brand-700 hover:underline"
              >
                {td("confirmNow")}
              </a>
            )}
          </div>
        )
      }
    />
  );

  return (
    <Drawer
      open={!!invoiceId}
      onClose={onClose}
      title={invoice ? td("title", { number: invoice.number }) : t("title")}
      width={720}
      destroyOnHidden
      extra={invoice ? <InvoiceStatusBadge status={invoice.status} /> : undefined}
    >
      {loading || (!invoice && !error) ? (
        <Loading />
      ) : error || !invoice ? (
        <div className="flex flex-col items-start gap-3">
          <NoderaAlert variant="error" message={error ?? td("notFound")} className="w-full" />
          <NoderaButton variant="outlined" size="small" onClick={load}>
            {t("retry")}
          </NoderaButton>
        </div>
      ) : (
        <div className="flex flex-col gap-section">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs text-text-muted">{t("columns.period")}</dt>
              <dd className="font-medium text-text">
                {t("period", {
                  start: formatUtcDate(invoice.periodStart, locale),
                  end: formatPeriodEnd(invoice.periodEnd, locale),
                })}
              </dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs text-text-muted">{t("columns.kind")}</dt>
              <dd className="font-medium text-text">{t(`kind.${invoice.kind}`)}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs text-text-muted">{t("columns.issued")}</dt>
              <dd className="font-medium text-text">
                {formatDateTime(invoice.issuedAt, locale)}
              </dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs text-text-muted">{t("columns.paid")}</dt>
              <dd className="font-medium text-text">
                {invoice.paidAt ? formatDateTime(invoice.paidAt, locale) : "—"}
              </dd>
            </div>
          </dl>

          {canWrite && isInvoicePayable(invoice.status) && openAttemptAlert}

          <div className="flex flex-wrap items-center gap-3">
            <NoderaButton
              variant="outlined"
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => download(invoice)}
              loading={downloadingId === invoice.id}
              disabled={!invoice.pdfAvailable}
            >
              {td("downloadPdf")}
            </NoderaButton>
            {!invoice.pdfAvailable && (
              <span className="text-xs text-text-muted">{td("pdfPending")}</span>
            )}
            {payable && (
              <NoderaButton
                variant="filled"
                size="small"
                onClick={() => setPayOpen(true)}
                className="ml-auto"
              >
                {td("payNow")}
              </NoderaButton>
            )}
          </div>

          <FormSection title={td("linesTitle")}>
            <InvoiceBreakdown invoice={invoice} />
          </FormSection>

          <FormSection title={td("paymentsTitle")}>
            <InvoicePaymentsList payments={invoice.payments ?? []} />
          </FormSection>

          {payable && (
            <PayInvoiceModal
              open={payOpen}
              teamId={teamId}
              invoice={invoice}
              paymentMethods={paymentMethods}
              onClose={() => setPayOpen(false)}
              onPaid={handlePaid}
            />
          )}
        </div>
      )}
    </Drawer>
  );
}
