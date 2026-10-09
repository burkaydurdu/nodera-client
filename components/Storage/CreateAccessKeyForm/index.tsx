"use client";

import { useState } from "react";
import { Radio } from "antd";
import { useTranslations } from "next-intl";
import { CreateAccessKey } from "@/api/storage";
import {
  ACCESS_KEY_NAME_MAX_LENGTH,
  ACCESS_KEY_PERMISSIONS,
  type AccessKeyPermission,
} from "@/core/storageApp";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { GetValidationErrors } from "@/utils/error";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import NoderaTextField from "@/components/NoderaTextField";
import type { CreateAccessKeyFormProps } from "./type";

/** A name to tell keys apart and what the key may do; the secret comes back once. */
export default function CreateAccessKeyForm({
  projectId,
  storageId,
  onCreated,
  onCancel,
  autoFocus = false,
}: CreateAccessKeyFormProps) {
  const t = useTranslations("storage.accessKeys.form");
  const tp = useTranslations("storage.accessKeys.permissions");
  const { getErrorMessage, getFieldErrorMessage } = useErrorMessage();

  const [name, setName] = useState("");
  const [permission, setPermission] = useState<AccessKeyPermission>("read_write");
  const [nameError, setNameError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (loading) return;
    setFormError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError(t("nameRequired"));
      return;
    }
    if (trimmed.length > ACCESS_KEY_NAME_MAX_LENGTH) {
      setNameError(t("nameTooLong", { max: ACCESS_KEY_NAME_MAX_LENGTH }));
      return;
    }
    setNameError(null);

    setLoading(true);
    try {
      const response = await CreateAccessKey(projectId, storageId, {
        name: trimmed,
        permission,
      });
      onCreated(response.data);
    } catch (error) {
      const nameField = GetValidationErrors(error).find((fe) => fe.field === "name");
      if (nameField) setNameError(getFieldErrorMessage(nameField));
      else setFormError(getErrorMessage(error));
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
        maxLength={ACCESS_KEY_NAME_MAX_LENGTH}
        autoFocus={autoFocus}
        onEnter={handleSubmit}
        disabled={loading}
        required
      />
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-text">{t("permission")}</span>
        <Radio.Group
          value={permission}
          onChange={(event) => setPermission(event.target.value as AccessKeyPermission)}
          disabled={loading}
          className="flex flex-col gap-2"
        >
          {ACCESS_KEY_PERMISSIONS.map((value) => (
            <Radio key={value} value={value}>
              <span className="flex flex-col leading-tight">
                <span className="text-sm text-text">{tp(value)}</span>
                <span className="text-xs text-text-muted">
                  {t(`permissionHints.${value}`)}
                </span>
              </span>
            </Radio>
          ))}
        </Radio.Group>
      </div>
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
