"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CreateSendingDomain } from "@/api/mail";
import { ErrorCode } from "@/core/error";
import {
  SENDING_DOMAIN_MAX_LENGTH,
  normalizeDomainName,
  validateDomainName,
} from "@/core/mail";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { GetValidationErrors, IsErrorCode } from "@/utils/error";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import NoderaTextField from "@/components/NoderaTextField";
import type { AddSendingDomainFormProps } from "./type";

export default function AddSendingDomainForm({
  projectId,
  existingNames,
  onCreated,
  onCancel,
  autoFocus = false,
}: AddSendingDomainFormProps) {
  const t = useTranslations("mail.domains.form");
  const { getErrorMessage, getFieldErrorMessage } = useErrorMessage();

  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (loading) return;
    setFormError(null);

    const normalized = normalizeDomainName(name);
    const issue = validateDomainName(name);
    if (issue) {
      setNameError(
        issue === "required"
          ? t("nameRequired")
          : issue === "tooLong"
            ? t("nameTooLong", { max: SENDING_DOMAIN_MAX_LENGTH })
            : t("nameFormat")
      );
      return;
    }
    if (existingNames.includes(normalized)) {
      setNameError(t("duplicate"));
      return;
    }
    setNameError(null);

    setLoading(true);
    try {
      const response = await CreateSendingDomain(projectId, { name: normalized });
      onCreated(response.data);
    } catch (error) {
      const nameField = GetValidationErrors(error).find((fe) => fe.field === "name");
      if (nameField) {
        setNameError(getFieldErrorMessage(nameField));
      } else if (
        IsErrorCode(error, ErrorCode.SendingDomainInvalidName) ||
        IsErrorCode(error, ErrorCode.SendingDomainAlreadyAdded)
      ) {
        setNameError(getErrorMessage(error));
      } else {
        setFormError(getErrorMessage(error));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-field">
      {formError && <NoderaAlert variant="error" message={formError} />}
      <NoderaTextField
        label={t("name")}
        value={name}
        onChange={setName}
        placeholder={t("namePlaceholder")}
        hint={t("nameHint")}
        error={nameError}
        maxLength={SENDING_DOMAIN_MAX_LENGTH}
        autoFocus={autoFocus}
        onEnter={handleSubmit}
        disabled={loading}
        required
      />
      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <NoderaButton variant="outlined" onClick={onCancel} disabled={loading}>
            {t("cancel")}
          </NoderaButton>
        )}
        <NoderaButton variant="filled" onClick={handleSubmit} loading={loading}>
          {t("submit")}
        </NoderaButton>
      </div>
    </div>
  );
}
