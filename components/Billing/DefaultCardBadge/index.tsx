import { useTranslations } from "next-intl";

/** Marks the card invoices are charged to. */
export default function DefaultCardBadge() {
  const t = useTranslations("billing.paymentMethods");

  return (
    <span className="inline-flex h-5 items-center rounded-badge bg-brand-50 px-2 text-[11px] font-semibold uppercase tracking-wide text-brand-700">
      {t("default")}
    </span>
  );
}
