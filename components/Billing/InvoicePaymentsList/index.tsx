"use client";

import { useLocale, useTranslations } from "next-intl";
import { useFailureReason } from "@/hooks/Billing/useFailureReason";
import { formatDateTime } from "@/utils/date";
import { formatMoney } from "@/utils/price";
import PaymentStatusBadge from "@/components/Billing/PaymentStatusBadge";
import type { InvoicePaymentsListProps } from "./type";

/** Every charge attempt of an invoice, newest first, with the outcome in the user's words. */
export default function InvoicePaymentsList({ payments }: InvoicePaymentsListProps) {
  const t = useTranslations("billing.invoices.detail");
  const locale = useLocale();
  const { describeFailureReason } = useFailureReason();

  if (payments.length === 0) {
    return <p className="text-sm text-text-muted">{t("paymentsEmpty")}</p>;
  }

  const ordered = [...payments].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <ul className="flex flex-col divide-y divide-border">
      {ordered.map((payment) => (
        <li key={payment.id} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-text">
              {formatDateTime(payment.createdAt, locale)}
            </span>
            <span className="flex items-center gap-3">
              <span className="font-mono text-sm font-medium text-text">
                {formatMoney(payment.amount, payment.currency)}
              </span>
              <PaymentStatusBadge status={payment.status} />
            </span>
          </div>
          {payment.status === "failed" && (
            <span className="text-xs text-danger">
              {describeFailureReason(payment.failureReason)}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
