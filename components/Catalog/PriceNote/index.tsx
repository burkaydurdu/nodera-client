import { useTranslations } from "next-intl";

/** The "excl. taxes, USD" disclaimer shown next to every price list. */
export default function PriceNote() {
  const t = useTranslations("catalog");
  return <p className="text-xs leading-4 text-text-muted">{t("taxNote")}</p>;
}
