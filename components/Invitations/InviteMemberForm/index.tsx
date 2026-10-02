"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CreateInvitation } from "@/api/invitations";
import { ROLES } from "@/core/authz";
import type { TeamRole } from "@/core/user";
import { isValidEmail } from "@/core/validation";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { GetValidationErrors } from "@/utils/error";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import NoderaSelect from "@/components/NoderaSelect";
import NoderaTextField from "@/components/NoderaTextField";
import type { InviteMemberFormProps } from "./type";

const DEFAULT_ROLE: TeamRole = "developer";

export default function InviteMemberForm({
  teamId,
  onCreated,
  onCancel,
  autoFocus = false,
}: InviteMemberFormProps) {
  const t = useTranslations("invitations.form");
  const tr = useTranslations("teams.roles");
  const td = useTranslations("teams.roleDescriptions");
  const tv = useTranslations("validation");
  const { getErrorMessage, getFieldErrorMessage } = useErrorMessage();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamRole>(DEFAULT_ROLE);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const roleOptions = ROLES.map((value) => ({ value, label: tr(value) }));

  const handleSubmit = async () => {
    if (loading) return;
    setFormError(null);
    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError(tv("emailRequired"));
      return;
    }
    if (!isValidEmail(trimmed)) {
      setEmailError(tv("emailInvalid"));
      return;
    }
    setEmailError(null);

    setLoading(true);
    try {
      const response = await CreateInvitation(teamId, { email: trimmed, role });
      onCreated(response.data);
    } catch (error) {
      const fieldError = GetValidationErrors(error).find((fe) => fe.field === "email");
      if (fieldError) setEmailError(getFieldErrorMessage(fieldError));
      else setFormError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-field">
      {formError && <NoderaAlert variant="error" message={formError} />}
      <NoderaTextField
        label={t("email")}
        kind="email"
        value={email}
        onChange={setEmail}
        placeholder={t("emailPlaceholder")}
        error={emailError}
        autoComplete="off"
        autoFocus={autoFocus}
        onEnter={handleSubmit}
        disabled={loading}
        required
      />
      <NoderaSelect<TeamRole>
        label={t("role")}
        value={role}
        onChange={setRole}
        options={roleOptions}
        hint={td(role)}
        searchable={false}
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
