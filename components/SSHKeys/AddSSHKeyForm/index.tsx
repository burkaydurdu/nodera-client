"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CreateSSHKey } from "@/api/sshKeys";
import { SSH_KEY_NAME_MAX_LENGTH, validatePublicKey } from "@/core/sshKey";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { GetStatus, GetValidationErrors, IsErrorCode } from "@/utils/error";
import { ErrorCode } from "@/core/error";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import NoderaTextField from "@/components/NoderaTextField";
import type { AddSSHKeyFormProps } from "./type";

export default function AddSSHKeyForm({
  teamId,
  onCreated,
  onCancel,
  autoFocus = false,
}: AddSSHKeyFormProps) {
  const t = useTranslations("sshKeys.form");
  const { getErrorMessage } = useErrorMessage();

  const [name, setName] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [keyError, setKeyError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (loading) return;
    setFormError(null);

    const trimmedName = name.trim();
    const nameIssue = !trimmedName
      ? t("nameRequired")
      : trimmedName.length > SSH_KEY_NAME_MAX_LENGTH
        ? t("nameTooLong", { max: SSH_KEY_NAME_MAX_LENGTH })
        : null;
    const keyIssue = validatePublicKey(publicKey);
    setNameError(nameIssue);
    setKeyError(
      keyIssue === "required" ? t("publicKeyRequired") : keyIssue ? t("publicKeyType") : null
    );
    if (nameIssue || keyIssue) return;

    setLoading(true);
    try {
      const response = await CreateSSHKey(teamId, {
        name: trimmedName,
        publicKey: publicKey.trim(),
      });
      onCreated(response.data);
    } catch (error) {
      const message = getErrorMessage(error);
      const fieldErrors = GetValidationErrors(error);
      const nameField = fieldErrors.find((fe) => fe.field === "name");
      const keyField = fieldErrors.find((fe) => fe.field === "public_key");
      if (nameField) setNameError(nameField.message);
      if (keyField) setKeyError(keyField.message);
      // Name and fingerprint clashes carry their own codes and translations; the
      // generic duplicate text covers a 409 without one.
      const knownDuplicate =
        IsErrorCode(error, ErrorCode.SSHKeyNameTaken) ||
        IsErrorCode(error, ErrorCode.SSHKeyFingerprintTaken);
      setFormError(GetStatus(error) === 409 && !knownDuplicate ? t("duplicate") : message);
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
        error={nameError}
        maxLength={SSH_KEY_NAME_MAX_LENGTH}
        autoFocus={autoFocus}
        onEnter={handleSubmit}
        disabled={loading}
        required
      />
      <NoderaTextField
        label={t("publicKey")}
        kind="textarea"
        value={publicKey}
        onChange={setPublicKey}
        placeholder={t("publicKeyPlaceholder")}
        hint={t("publicKeyHint")}
        error={keyError}
        rows={4}
        disabled={loading}
        className="font-mono"
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
