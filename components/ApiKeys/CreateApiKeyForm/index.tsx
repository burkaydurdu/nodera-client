"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CreateApiKey } from "@/api/apiKeys";
import { API_KEY_NAME_MAX_LENGTH } from "@/core/apiKey";
import { KEY_PERMISSIONS, type KeyPermission, allows } from "@/core/authz";
import { ErrorCode } from "@/core/error";
import useTeam from "@/contexts/TeamContext/useTeam";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { GetValidationErrors, IsErrorCode } from "@/utils/error";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import NoderaCheckbox from "@/components/NoderaCheckbox";
import NoderaFormField from "@/components/NoderaFormField";
import NoderaTextField from "@/components/NoderaTextField";
import type { CreateApiKeyFormProps } from "./type";

/** A key's name and its Permissions; a key never carries one its creator's Role lacks. */
export default function CreateApiKeyForm({
  teamId,
  projectId,
  onCreated,
  onCancel,
  autoFocus = false,
}: CreateApiKeyFormProps) {
  const t = useTranslations("apiKeys.form");
  const tp = useTranslations("apiKeys.permissions");
  const { currentTeam } = useTeam();
  const { getErrorMessage, getFieldErrorMessage } = useErrorMessage();
  const role = currentTeam?.role;
  const heldPermissions = KEY_PERMISSIONS.filter((permission) => allows(role, permission));

  const [name, setName] = useState("");
  const [permissions, setPermissions] = useState<KeyPermission[]>(heldPermissions);
  const [nameError, setNameError] = useState<string | null>(null);
  const [permissionsError, setPermissionsError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const togglePermission = (permission: KeyPermission, checked: boolean) => {
    setPermissionsError(null);
    setPermissions((current) =>
      checked
        ? [...current.filter((item) => item !== permission), permission]
        : current.filter((item) => item !== permission)
    );
  };

  const handleSubmit = async () => {
    if (loading) return;
    setFormError(null);

    const trimmedName = name.trim();
    const nameIssue = !trimmedName
      ? t("nameRequired")
      : trimmedName.length > API_KEY_NAME_MAX_LENGTH
        ? t("nameTooLong", { max: API_KEY_NAME_MAX_LENGTH })
        : null;
    const permissionsIssue = permissions.length === 0 ? t("permissionsRequired") : null;
    setNameError(nameIssue);
    setPermissionsError(permissionsIssue);
    if (nameIssue || permissionsIssue) return;

    setLoading(true);
    try {
      const response = await CreateApiKey(teamId, projectId, {
        name: trimmedName,
        permissions,
      });
      onCreated(response.data);
    } catch (error) {
      const fieldErrors = GetValidationErrors(error);
      const nameField = fieldErrors.find((fe) => fe.field === "name");
      const permissionsField = fieldErrors.find((fe) => fe.field.startsWith("permissions"));
      if (nameField) setNameError(getFieldErrorMessage(nameField));
      if (permissionsField) setPermissionsError(getFieldErrorMessage(permissionsField));
      if (fieldErrors.length > 0) return;
      // These refusals are about the Permissions chosen, so they show under them.
      if (
        IsErrorCode(error, ErrorCode.ApiKeyPermissionNotAllowed) ||
        IsErrorCode(error, ErrorCode.ApiKeyPermissionNotHeld)
      ) {
        setPermissionsError(getErrorMessage(error));
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
        maxLength={API_KEY_NAME_MAX_LENGTH}
        autoFocus={autoFocus}
        onEnter={handleSubmit}
        disabled={loading}
        required
      />
      <NoderaFormField label={t("permissions")} error={permissionsError} required>
        <div className="flex flex-col gap-2">
          {KEY_PERMISSIONS.map((permission) => {
            const held = heldPermissions.includes(permission);
            return (
              <NoderaCheckbox
                key={permission}
                checked={permissions.includes(permission)}
                disabled={loading || !held}
                onChange={(event) => togglePermission(permission, event.target.checked)}
              >
                <span className="flex flex-col">
                  <span className="text-sm font-medium text-text">
                    {tp(`${permission}.label`)}{" "}
                    <span className="font-mono text-xs text-text-muted">{permission}</span>
                  </span>
                  <span className="text-xs text-text-muted">
                    {held ? tp(`${permission}.description`) : t("permissionNotHeld")}
                  </span>
                </span>
              </NoderaCheckbox>
            );
          })}
        </div>
      </NoderaFormField>
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
