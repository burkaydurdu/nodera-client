"use client";

import { useEffect, useState } from "react";
import { Modal } from "antd";
import { useTranslations } from "next-intl";
import { PayInvoice } from "@/api/billing";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { formatMoney } from "@/utils/price";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import NoderaSelect from "@/components/NoderaSelect";
import type { PayInvoiceModalProps } from "./type";

/** "" stands for the default card: the service picks it when no id is sent. */
const DEFAULT_CARD = "";

export default function PayInvoiceModal({
  open,
  teamId,
  invoice,
  paymentMethods,
  onClose,
  onPaid,
}: PayInvoiceModalProps) {
  const t = useTranslations("billing.invoices.pay");
  const tc = useTranslations("billing.paymentMethods");
  const { getErrorMessage } = useErrorMessage();

  const [methodId, setMethodId] = useState<string>(DEFAULT_CARD);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (open) {
      setMethodId(DEFAULT_CARD);
      setError(null);
      setRedirecting(false);
    }
  }, [open]);

  // Back from the bank page through the browser's back button, the page is restored from
  // the back-forward cache with the modal still "redirecting"; it must be usable again.
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      setRedirecting(false);
      setSubmitting(false);
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  const defaultCard = paymentMethods.find((method) => method.isDefault) ?? null;
  const selectedCard =
    methodId === DEFAULT_CARD
      ? defaultCard
      : (paymentMethods.find((method) => method.id === methodId) ?? null);
  // A card held in the settlement currency (TRY for a Turkish Team) is charged the settlement
  // amount; any other card is charged the invoice total in its own currency.
  const chargedInSettlement =
    !!selectedCard &&
    !!invoice.settlementAmount &&
    !!invoice.settlementCurrency &&
    selectedCard.currency === invoice.settlementCurrency;
  const amount = chargedInSettlement
    ? formatMoney(invoice.settlementAmount, invoice.settlementCurrency)
    : formatMoney(invoice.totalDue, invoice.currency);

  const options = [
    {
      value: DEFAULT_CARD,
      label: defaultCard
        ? t("defaultCard", { last4: defaultCard.last4 })
        : t("defaultCardGeneric"),
    },
    ...paymentMethods
      .filter((method) => !method.isDefault)
      .map((method) => ({
        value: method.id,
        label: tc("cardLabel", { brand: method.brand, last4: method.last4 }),
      })),
  ];

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await PayInvoice(
        teamId,
        invoice.id,
        methodId === DEFAULT_CARD ? {} : { paymentMethodId: methodId }
      );
      const payment = response.data;
      // The bank wants 3-D Secure and the page is already known: go there now. Without a URL
      // the confirmation link arrives by email; the caller says so.
      if (payment.status === "confirmation_required" && payment.confirmationUrl) {
        setRedirecting(true);
        window.location.assign(payment.confirmationUrl);
        return;
      }
      onPaid(payment);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={t("title", { number: invoice.number })}
      footer={null}
      centered
      destroyOnHidden
      width={480}
    >
      <div className="flex flex-col gap-field pt-2">
        {error && <NoderaAlert variant="error" message={error} />}
        {redirecting && <NoderaAlert variant="info" message={t("confirmationRequired")} />}
        <p className="text-sm text-text-muted">{t("description", { amount })}</p>
        <NoderaSelect
          label={t("card")}
          value={methodId}
          onChange={setMethodId}
          options={options}
          searchable={false}
          disabled={submitting || redirecting || paymentMethods.length <= 1}
        />
        <div className="flex justify-end gap-3 pt-2">
          <NoderaButton variant="outlined" onClick={onClose} disabled={submitting}>
            {t("cancel")}
          </NoderaButton>
          <NoderaButton
            variant="filled"
            onClick={handleSubmit}
            loading={submitting || redirecting}
          >
            {t("submit", { amount })}
          </NoderaButton>
        </div>
      </div>
    </Modal>
  );
}
