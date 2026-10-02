"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CreateTeam } from "@/api/teams";
import { TEAM_NAME_MAX_LENGTH } from "@/core/team";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { GetValidationErrors } from "@/utils/error";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import NoderaTextField from "@/components/NoderaTextField";
import type { CreateTeamFormProps } from "./type";

export default function CreateTeamForm({
  onCreated,
  onCancel,
  autoFocus = false,
}: CreateTeamFormProps) {
  const t = useTranslations("teams.create");
  const tv = useTranslations("validation");
  const { getErrorMessage, getFieldErrorMessage } = useErrorMessage();

  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (loading) return;
    setFormError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError(tv("teamNameRequired"));
      return;
    }
    if (trimmed.length > TEAM_NAME_MAX_LENGTH) {
      setNameError(tv("teamNameTooLong", { max: TEAM_NAME_MAX_LENGTH }));
      return;
    }
    setNameError(null);

    setLoading(true);
    try {
      const response = await CreateTeam({ name: trimmed });
      onCreated(response.data);
    } catch (error) {
      const fieldError = GetValidationErrors(error).find((fe) => fe.field === "name");
      if (fieldError) setNameError(getFieldErrorMessage(fieldError));
      setFormError(getErrorMessage(error));
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
        maxLength={TEAM_NAME_MAX_LENGTH}
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
