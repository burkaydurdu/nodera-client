"use client";

import { useEffect, useMemo, useState } from "react";
import { App, Radio } from "antd";
import { useLocale, useTranslations } from "next-intl";
import { PutProfile } from "@/api/billing";
import {
  ADDRESS_MAX_LENGTH,
  type BillingAccountType,
  type BillingProfile,
  type BillingProfilePayload,
  CITY_MAX_LENGTH,
  LEGAL_NAME_MAX_LENGTH,
  POSTAL_CODE_MAX_LENGTH,
  TAX_OFFICE_MAX_LENGTH,
  VAT_ID_MAX_LENGTH,
  isValidTckn,
  isValidVkn,
  taxIdRuleFor,
} from "@/core/billing";
import { getCountryOptions } from "@/core/countries";
import { ErrorCode } from "@/core/error";
import type { Locale } from "@/core/locale";
import { isValidEmail } from "@/core/validation";
import useAuth from "@/contexts/AuthContext/useAuth";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { GetValidationErrors, IsErrorCode } from "@/utils/error";
import Card from "@/components/Card";
import FormSection from "@/components/FormSection";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import NoderaFormField from "@/components/NoderaFormField";
import NoderaSelect from "@/components/NoderaSelect";
import NoderaTextField from "@/components/NoderaTextField";
import type { BillingProfileFormProps } from "./type";

type Field = keyof BillingProfilePayload;
type FieldErrors = Partial<Record<Field, string>>;

/** The service's 400 field names → the form's fields. */
const WIRE_FIELDS: Record<string, Field> = {
  account_type: "accountType",
  legal_name: "legalName",
  country: "country",
  address_line1: "addressLine1",
  address_line2: "addressLine2",
  city: "city",
  postal_code: "postalCode",
  tax_id: "taxId",
  tax_office: "taxOffice",
  vat_id: "vatId",
  invoice_email: "invoiceEmail",
};

const toPayload = (
  profile: BillingProfile | null,
  country: string
): BillingProfilePayload => ({
  accountType: profile?.accountType ?? "individual",
  legalName: profile?.legalName ?? "",
  country: profile?.country ?? country,
  addressLine1: profile?.addressLine1 ?? "",
  addressLine2: profile?.addressLine2 ?? "",
  city: profile?.city ?? "",
  postalCode: profile?.postalCode ?? "",
  taxId: profile?.taxId ?? "",
  taxOffice: profile?.taxOffice ?? "",
  vatId: profile?.vatId ?? "",
  invoiceEmail: profile?.invoiceEmail ?? "",
});

/** Trimmed, with the identifiers the country and account type do not ask for dropped. */
const normalize = (values: BillingProfilePayload): BillingProfilePayload => {
  const rule = taxIdRuleFor(values.country, values.accountType);
  return {
    accountType: values.accountType,
    legalName: values.legalName.trim(),
    country: values.country,
    addressLine1: values.addressLine1.trim(),
    addressLine2: values.addressLine2.trim(),
    city: values.city.trim(),
    postalCode: values.postalCode.trim(),
    taxId: rule === "optional" ? "" : values.taxId.trim(),
    taxOffice: rule === "vkn" ? values.taxOffice.trim() : "",
    vatId: rule === "optional" ? values.vatId.trim() : "",
    invoiceEmail: values.invoiceEmail.trim(),
  };
};

export default function BillingProfileForm({
  teamId,
  profile,
  canWrite,
  onSaved,
}: BillingProfileFormProps) {
  const t = useTranslations("billing.profile");
  const locale = useLocale() as Locale;
  const { message } = App.useApp();
  const { currentUser } = useAuth();
  const { getErrorMessage, getFieldErrorMessage } = useErrorMessage();

  const initial = useMemo(
    () => toPayload(profile, currentUser?.country ?? ""),
    [profile, currentUser?.country]
  );
  const [values, setValues] = useState<BillingProfilePayload>(initial);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setValues(initial);
    setFieldErrors({});
    setFormError(null);
  }, [initial]);

  const countryOptions = useMemo(() => getCountryOptions(locale), [locale]);
  const rule = taxIdRuleFor(values.country, values.accountType);
  const disabled = loading || !canWrite;
  const dirty = JSON.stringify(normalize(values)) !== JSON.stringify(normalize(initial));

  const set = <K extends Field>(field: K, value: BillingProfilePayload[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) =>
      current[field] ? { ...current, [field]: undefined } : current
    );
  };

  const validate = (payload: BillingProfilePayload): FieldErrors => {
    const errors: FieldErrors = {};
    if (!payload.legalName) errors.legalName = t("errors.legalNameRequired");
    if (!payload.country) errors.country = t("errors.countryRequired");
    if (!payload.addressLine1) errors.addressLine1 = t("errors.addressRequired");
    if (!payload.city) errors.city = t("errors.cityRequired");
    if (!payload.invoiceEmail) errors.invoiceEmail = t("errors.invoiceEmailRequired");
    else if (!isValidEmail(payload.invoiceEmail))
      errors.invoiceEmail = t("errors.invoiceEmailInvalid");
    if (rule === "vkn") {
      if (!isValidVkn(payload.taxId)) errors.taxId = t("errors.vknInvalid");
      if (!payload.taxOffice) errors.taxOffice = t("errors.taxOfficeRequired");
    }
    if (rule === "tckn" && !isValidTckn(payload.taxId)) errors.taxId = t("errors.tcknInvalid");
    return errors;
  };

  const handleSubmit = async () => {
    if (loading || !canWrite) return;
    setFormError(null);
    const payload = normalize(values);
    const errors = validate(payload);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      const response = await PutProfile(teamId, payload);
      onSaved(response.data);
      message.success(t("saved"));
    } catch (error) {
      const serverErrors: FieldErrors = {};
      for (const fieldError of GetValidationErrors(error)) {
        const field = WIRE_FIELDS[fieldError.field];
        if (field) serverErrors[field] = getFieldErrorMessage(fieldError);
      }
      // The identifier rule lives on the server too (checksum, country, account type): its
      // answer belongs under the field the user has to fix, not in a form-wide alert.
      if (IsErrorCode(error, ErrorCode.BillingProfileInvalidTaxId)) {
        serverErrors.taxId = getErrorMessage(error);
      }
      if (Object.keys(serverErrors).length > 0) setFieldErrors(serverErrors);
      else setFormError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const accountTypeOptions: Array<{ value: BillingAccountType; label: string }> = [
    { value: "individual", label: t("individual") },
    { value: "company", label: t("company") },
  ];

  return (
    <Card>
      <FormSection title={t("title")} description={t("description")}>
        {!canWrite && <NoderaAlert variant="info" message={t("readOnly")} />}
        {formError && <NoderaAlert variant="error" message={formError} />}

        <NoderaFormField label={t("accountType")} required error={fieldErrors.accountType}>
          <Radio.Group
            value={values.accountType}
            onChange={(event) => set("accountType", event.target.value as BillingAccountType)}
            options={accountTypeOptions}
            optionType="button"
            buttonStyle="solid"
            disabled={disabled}
          />
        </NoderaFormField>

        <NoderaTextField
          label={values.accountType === "company" ? t("companyName") : t("fullName")}
          value={values.legalName}
          onChange={(value) => set("legalName", value)}
          error={fieldErrors.legalName}
          hint={t("legalNameHint")}
          maxLength={LEGAL_NAME_MAX_LENGTH}
          autoComplete="organization"
          disabled={disabled}
          required
        />

        <NoderaSelect
          label={t("country")}
          value={values.country || undefined}
          onChange={(value) => set("country", value)}
          options={countryOptions}
          error={fieldErrors.country}
          hint={profile ? t("countryHint") : undefined}
          disabled={disabled}
          required
        />

        <NoderaTextField
          label={t("addressLine1")}
          value={values.addressLine1}
          onChange={(value) => set("addressLine1", value)}
          error={fieldErrors.addressLine1}
          maxLength={ADDRESS_MAX_LENGTH}
          autoComplete="address-line1"
          disabled={disabled}
          required
        />
        <NoderaTextField
          label={t("addressLine2")}
          value={values.addressLine2}
          onChange={(value) => set("addressLine2", value)}
          error={fieldErrors.addressLine2}
          maxLength={ADDRESS_MAX_LENGTH}
          autoComplete="address-line2"
          disabled={disabled}
        />
        <div className="grid grid-cols-1 gap-field sm:grid-cols-2">
          <NoderaTextField
            label={t("city")}
            value={values.city}
            onChange={(value) => set("city", value)}
            error={fieldErrors.city}
            maxLength={CITY_MAX_LENGTH}
            autoComplete="address-level2"
            disabled={disabled}
            required
          />
          <NoderaTextField
            label={t("postalCode")}
            value={values.postalCode}
            onChange={(value) => set("postalCode", value)}
            error={fieldErrors.postalCode}
            maxLength={POSTAL_CODE_MAX_LENGTH}
            autoComplete="postal-code"
            disabled={disabled}
          />
        </div>

        {rule === "vkn" && (
          <div className="grid grid-cols-1 gap-field sm:grid-cols-2">
            <NoderaTextField
              label={t("vkn")}
              value={values.taxId}
              onChange={(value) => set("taxId", value)}
              error={fieldErrors.taxId}
              hint={t("vknHint")}
              maxLength={10}
              inputMode="numeric"
              autoComplete="off"
              disabled={disabled}
              required
            />
            <NoderaTextField
              label={t("taxOffice")}
              value={values.taxOffice}
              onChange={(value) => set("taxOffice", value)}
              error={fieldErrors.taxOffice}
              maxLength={TAX_OFFICE_MAX_LENGTH}
              autoComplete="off"
              disabled={disabled}
              required
            />
          </div>
        )}
        {rule === "tckn" && (
          <NoderaTextField
            label={t("tckn")}
            value={values.taxId}
            onChange={(value) => set("taxId", value)}
            error={fieldErrors.taxId}
            hint={t("tcknHint")}
            maxLength={11}
            inputMode="numeric"
            autoComplete="off"
            disabled={disabled}
            required
          />
        )}
        {rule === "optional" && (
          <NoderaTextField
            label={t("vatId")}
            value={values.vatId}
            onChange={(value) => set("vatId", value)}
            error={fieldErrors.vatId}
            hint={t("vatIdHint")}
            maxLength={VAT_ID_MAX_LENGTH}
            autoComplete="off"
            disabled={disabled}
          />
        )}

        <NoderaTextField
          label={t("invoiceEmail")}
          kind="email"
          value={values.invoiceEmail}
          onChange={(value) => set("invoiceEmail", value)}
          error={fieldErrors.invoiceEmail}
          hint={t("invoiceEmailHint")}
          autoComplete="email"
          disabled={disabled}
          onEnter={handleSubmit}
          required
        />

        {canWrite && (
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
        )}
      </FormSection>
    </Card>
  );
}
