"use client";

import { useState } from "react";
import { App } from "antd";
import { useTranslations } from "next-intl";
import { ChangePassword } from "@/api/users";
import { isPasswordValid } from "@/core/password";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import Card from "@/components/Card";
import FormSection from "@/components/FormSection";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import NoderaTextField from "@/components/NoderaTextField";
import PasswordChecklist from "@/components/PasswordChecklist";

export default function ChangePasswordForm() {
  const t = useTranslations("profile.password");
  const tv = useTranslations("validation");
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessage();

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [currentError, setCurrentError] = useState<string | null>(null);
  const [nextError, setNextError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (loading) return;
    setFormError(null);
    let valid = true;
    if (!current) {
      setCurrentError(tv("currentPasswordRequired"));
      valid = false;
    } else {
      setCurrentError(null);
    }
    if (!next) {
      setNextError(tv("passwordRequired"));
      valid = false;
    } else if (!isPasswordValid(next)) {
      setNextError(tv("passwordInvalid"));
      valid = false;
    } else {
      setNextError(null);
    }
    if (confirm !== next) {
      setConfirmError(tv("passwordMismatch"));
      valid = false;
    } else {
      setConfirmError(null);
    }
    if (!valid) return;

    setLoading(true);
    try {
      await ChangePassword({
        currentPassword: current,
        newPassword: next,
        newPasswordConfirm: confirm,
      });
      message.success(t("changed"));
      setCurrent("");
      setNext("");
      setConfirm("");
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
          label={t("current")}
          kind="password"
          value={current}
          onChange={setCurrent}
          error={currentError}
          autoComplete="current-password"
          disabled={loading}
          required
        />
        <div className="flex flex-col gap-2">
          <NoderaTextField
            label={t("new")}
            kind="password"
            value={next}
            onChange={setNext}
            error={nextError}
            autoComplete="new-password"
            disabled={loading}
            required
          />
          <PasswordChecklist password={next} />
        </div>
        <NoderaTextField
          label={t("confirm")}
          kind="password"
          value={confirm}
          onChange={setConfirm}
          error={confirmError}
          autoComplete="new-password"
          onEnter={handleSubmit}
          disabled={loading}
          required
        />
        <div className="flex justify-end pt-2">
          <NoderaButton variant="filled" onClick={handleSubmit} loading={loading}>
            {t("submit")}
          </NoderaButton>
        </div>
      </FormSection>
    </Card>
  );
}
