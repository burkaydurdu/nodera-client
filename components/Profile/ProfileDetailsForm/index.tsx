"use client";

import { useEffect, useMemo, useState } from "react";
import { App } from "antd";
import { useLocale, useTranslations } from "next-intl";
import { UpdateMe } from "@/api/users";
import { getCountryOptions } from "@/core/countries";
import { LOCALES, type Locale } from "@/core/locale";
import { FULL_NAME_MAX_LENGTH } from "@/core/validation";
import useSetLanguage from "@/hooks/Language/useSetLanguage";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import Card from "@/components/Card";
import FormSection from "@/components/FormSection";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import NoderaSelect from "@/components/NoderaSelect";
import NoderaTextField from "@/components/NoderaTextField";
import type { ProfileDetailsFormProps } from "./type";

export default function ProfileDetailsForm({ user, onUpdated }: ProfileDetailsFormProps) {
  const t = useTranslations("profile.details");
  const tl = useTranslations("language");
  const tv = useTranslations("validation");
  const uiLocale = useLocale() as Locale;
  const { message } = App.useApp();
  const { setLanguage } = useSetLanguage();
  const { getErrorMessage } = useErrorMessage();

  const [fullName, setFullName] = useState(user.fullName);
  const [locale, setLocale] = useState<Locale>((user.locale as Locale) || uiLocale);
  const [country, setCountry] = useState<string | undefined>(user.country || undefined);
  const [fullNameError, setFullNameError] = useState<string | null>(null);
  const [countryError, setCountryError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFullName(user.fullName);
    setLocale((user.locale as Locale) || uiLocale);
    setCountry(user.country || undefined);
  }, [user]);

  const countryOptions = useMemo(() => getCountryOptions(uiLocale), [uiLocale]);
  const localeOptions = useMemo(
    () => LOCALES.map((code) => ({ value: code, label: tl(code) })),
    [tl]
  );

  const dirty =
    fullName.trim() !== user.fullName ||
    locale !== user.locale ||
    (country ?? "") !== user.country;

  const handleSubmit = async () => {
    if (loading) return;
    setFormError(null);
    let valid = true;
    if (!fullName.trim()) {
      setFullNameError(tv("fullNameRequired"));
      valid = false;
    } else {
      setFullNameError(null);
    }
    if (!country) {
      setCountryError(tv("countryRequired"));
      valid = false;
    } else {
      setCountryError(null);
    }
    if (!valid) return;

    setLoading(true);
    try {
      const response = await UpdateMe({
        fullName: fullName.trim(),
        locale,
        country: country!,
      });
      onUpdated(response.data);
      message.success(t("saved"));
      if (locale !== uiLocale) {
        await setLanguage(locale);
      }
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <FormSection title={t("title")} description={t("description")}>
        {formError && <NoderaAlert variant="error" message={formError} />}
        <NoderaTextField
          label={t("fullName")}
          value={fullName}
          onChange={setFullName}
          error={fullNameError}
          maxLength={FULL_NAME_MAX_LENGTH}
          autoComplete="name"
          disabled={loading}
          required
        />
        <div className="grid grid-cols-1 gap-field sm:grid-cols-2">
          <NoderaSelect<Locale>
            label={t("locale")}
            value={locale}
            onChange={setLocale}
            options={localeOptions}
            searchable={false}
            disabled={loading}
            hint={t("localeHint")}
          />
          <NoderaSelect
            label={t("country")}
            value={country}
            onChange={setCountry}
            options={countryOptions}
            error={countryError}
            disabled={loading}
            required
          />
        </div>
        <div className="flex justify-end pt-2">
          <NoderaButton
            variant="filled"
            onClick={handleSubmit}
            loading={loading}
            disabled={!dirty}
          >
            {t("save")}
          </NoderaButton>
        </div>
      </FormSection>
    </Card>
  );
}
