"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { OpenStorage } from "@/api/storage";
import { billingPath } from "@/core/billing";
import { ErrorCode } from "@/core/error";
import { normalizeBucketName, validateBucketName } from "@/core/storageApp";
import useTeam from "@/contexts/TeamContext/useTeam";
import { useCan } from "@/hooks/Authz/useCan";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { GetValidationErrors, IsErrorCode } from "@/utils/error";
import { formatStorageSize } from "@/utils/number";
import { formatUsd } from "@/utils/price";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import NoderaLink from "@/components/NoderaLink";
import NoderaSelect from "@/components/NoderaSelect";
import BucketNameField from "@/components/Storage/BucketNameField";
import type { OpenStorageFormProps } from "./type";

/**
 * Opens a Storage in one step: a Bucket name, a Region and a Package. Opening is synchronous,
 * so the answer is a Storage that can be used at once. What the Team's Billing status refuses
 * (no card, suspended) is told with the way to fix it; a taken or reserved name goes on the
 * field so another can be picked.
 */
export default function OpenStorageForm({
  projectId,
  regions,
  packages,
  onOpened,
  onCancel,
}: OpenStorageFormProps) {
  const t = useTranslations("storage.open");
  const locale = useLocale();
  const { currentTeam } = useTeam();
  const canPay = useCan("billing.write");
  const { getErrorMessage, getFieldErrorMessage } = useErrorMessage();

  const [bucketName, setBucketName] = useState("");
  const [region, setRegion] = useState<string | undefined>(
    regions.length === 1 ? regions[0].code : undefined
  );
  const [packageCode, setPackageCode] = useState<string | undefined>(undefined);
  const [touched, setTouched] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [regionError, setRegionError] = useState<string | null>(null);
  const [packageError, setPackageError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [billingLink, setBillingLink] = useState<"card" | "invoice" | null>(null);
  const [loading, setLoading] = useState(false);

  // A refusal names one Bucket name; another name has to be judged afresh.
  useEffect(() => {
    setNameError(null);
  }, [bucketName]);

  const chosenPackage = packages.find((pkg) => pkg.code === packageCode) ?? null;

  const handleSubmit = async () => {
    if (loading) return;
    setTouched(true);
    setFormError(null);
    setBillingLink(null);

    const name = normalizeBucketName(bucketName);
    const issue = validateBucketName(name);
    const missingRegion = !region;
    const missingPackage = !packageCode;
    setRegionError(missingRegion ? t("regionRequired") : null);
    setPackageError(missingPackage ? t("packageRequired") : null);
    if (issue || missingRegion || missingPackage) return;

    setLoading(true);
    try {
      const response = await OpenStorage(projectId, {
        bucketName: name,
        region: region!,
        package: packageCode!,
      });
      onOpened(response.data);
    } catch (error) {
      const nameField = GetValidationErrors(error).find((fe) => fe.field === "bucket_name");
      if (nameField) {
        setNameError(getFieldErrorMessage(nameField));
      } else if (
        IsErrorCode(error, ErrorCode.StorageInvalidBucketName) ||
        IsErrorCode(error, ErrorCode.StorageReservedBucketName) ||
        IsErrorCode(error, ErrorCode.StorageBucketNameTaken)
      ) {
        setNameError(getErrorMessage(error));
      } else if (IsErrorCode(error, ErrorCode.StorageUnknownRegion)) {
        setRegionError(getErrorMessage(error));
      } else if (IsErrorCode(error, ErrorCode.StorageUnknownPackage)) {
        setPackageError(getErrorMessage(error));
      } else {
        setFormError(getErrorMessage(error));
        if (IsErrorCode(error, ErrorCode.StoragePaymentMethodRequired)) setBillingLink("card");
        if (IsErrorCode(error, ErrorCode.StorageTeamSuspended)) setBillingLink("invoice");
      }
    } finally {
      setLoading(false);
    }
  };

  const billingHref =
    currentTeam && billingLink
      ? billingPath(
          billingLink === "card" ? "payment-methods" : "invoices",
          null,
          currentTeam.id
        )
      : null;

  return (
    <div className="flex flex-col gap-field">
      {formError && (
        <NoderaAlert
          variant="error"
          message={formError}
          description={
            billingHref && canPay ? (
              <NoderaLink href={billingHref}>
                {billingLink === "card" ? t("addCard") : t("payInvoice")}
              </NoderaLink>
            ) : billingLink ? (
              t("askBilling")
            ) : undefined
          }
        />
      )}
      <BucketNameField
        value={bucketName}
        onChange={setBucketName}
        serverError={nameError}
        touched={touched}
        disabled={loading}
        autoFocus
        onEnter={handleSubmit}
      />
      <NoderaSelect
        label={t("region")}
        value={region}
        onChange={(value) => {
          setRegion(value);
          setRegionError(null);
        }}
        options={regions.map((item) => ({
          value: item.code,
          label: t("regionOption", {
            code: item.code,
            city: item.city,
            country: item.country,
          }),
        }))}
        placeholder={t("regionPlaceholder")}
        hint={t("regionHint")}
        error={regionError}
        disabled={loading}
        required
      />
      <NoderaSelect
        label={t("package")}
        value={packageCode}
        onChange={(value) => {
          setPackageCode(value);
          setPackageError(null);
        }}
        options={packages.map((pkg) => ({
          value: pkg.code,
          label: t("packageOption", {
            code: pkg.code,
            size: formatStorageSize(pkg.sizeBytes, locale),
            price: formatUsd(pkg.monthlyPrice),
          }),
        }))}
        placeholder={t("packagePlaceholder")}
        hint={
          chosenPackage
            ? t("packageChosen", {
                size: formatStorageSize(chosenPackage.sizeBytes, locale),
                price: formatUsd(chosenPackage.monthlyPrice),
              })
            : t("packageHint")
        }
        error={packageError}
        disabled={loading}
        required
      />
      <div className="flex justify-end gap-3 pt-2">
        <NoderaButton variant="outlined" onClick={onCancel} disabled={loading}>
          {t("cancel")}
        </NoderaButton>
        <NoderaButton variant="filled" onClick={handleSubmit} loading={loading}>
          {t("submit")}
        </NoderaButton>
      </div>
    </div>
  );
}
