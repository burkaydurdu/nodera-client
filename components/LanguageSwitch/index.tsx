"use client";

import { Segmented } from "antd";
import { useLocale, useTranslations } from "next-intl";
import { LOCALES, type Locale } from "@/core/locale";
import useSetLanguage from "@/hooks/Language/useSetLanguage";

/** tr/en toggle; writes the NEXT_LOCALE cookie and re-renders the tree. */
export default function LanguageSwitch() {
  const locale = useLocale() as Locale;
  const t = useTranslations("language");
  const { setLanguage, isPending } = useSetLanguage();

  return (
    <Segmented<Locale>
      size="small"
      value={locale}
      disabled={isPending}
      options={LOCALES.map((code) => ({ value: code, label: t(code) }))}
      onChange={(value) => {
        if (value !== locale) setLanguage(value);
      }}
    />
  );
}
