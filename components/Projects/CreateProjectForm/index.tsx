"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CreateProject } from "@/api/projects";
import { ErrorCode } from "@/core/error";
import { PROJECT_DESCRIPTION_MAX_LENGTH, PROJECT_NAME_MAX_LENGTH } from "@/core/project";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { GetValidationErrors, IsErrorCode } from "@/utils/error";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import NoderaTextField from "@/components/NoderaTextField";
import type { CreateProjectFormProps } from "./type";

export default function CreateProjectForm({
  teamId,
  onCreated,
  onCancel,
  autoFocus = false,
}: CreateProjectFormProps) {
  const t = useTranslations("dashboard.projectForm");
  const tv = useTranslations("validation");
  const { getErrorMessage } = useErrorMessage();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (loading) return;
    setFormError(null);
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError(tv("projectNameRequired"));
      return;
    }
    setNameError(null);

    setLoading(true);
    try {
      const response = await CreateProject(teamId, {
        name: trimmedName,
        description: description.trim(),
      });
      onCreated(response.data);
    } catch (error) {
      const message = getErrorMessage(error);
      if (IsErrorCode(error, ErrorCode.ProjectNameTaken)) {
        setNameError(message);
      } else {
        const fieldError = GetValidationErrors(error).find((fe) => fe.field === "name");
        if (fieldError) setNameError(fieldError.message);
        setFormError(message);
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
        error={nameError}
        maxLength={PROJECT_NAME_MAX_LENGTH}
        autoFocus={autoFocus}
        onEnter={handleSubmit}
        disabled={loading}
        required
      />
      <NoderaTextField
        label={t("description")}
        kind="textarea"
        value={description}
        onChange={setDescription}
        placeholder={t("descriptionPlaceholder")}
        maxLength={PROJECT_DESCRIPTION_MAX_LENGTH}
        rows={3}
        disabled={loading}
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
