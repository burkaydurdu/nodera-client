"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircleFilled } from "@ant-design/icons";
import { ResetPassword } from "@/api/auth";
import { isPasswordValid } from "@/core/password";
import { useNavigate } from "@/hooks/Navigation/useNavigate";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import AuthCardHeader from "@/components/Auth/AuthCardHeader";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import NoderaLink from "@/components/NoderaLink";
import NoderaTextField from "@/components/NoderaTextField";
import PasswordChecklist from "@/components/PasswordChecklist";
import type { ResetPasswordCardProps } from "./type";

export default function ResetPasswordCard({ token }: ResetPasswordCardProps) {
  const t = useTranslations("auth.resetPassword");
  const tv = useTranslations("validation");
  const { navigate } = useNavigate();
  const { getErrorMessage } = useErrorMessage();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (loading) return;
    setFormError(null);
    let valid = true;
    if (!password) {
      setPasswordError(tv("passwordRequired"));
      valid = false;
    } else if (!isPasswordValid(password)) {
      setPasswordError(tv("passwordInvalid"));
      valid = false;
    } else {
      setPasswordError(null);
    }
    if (confirm !== password) {
      setConfirmError(tv("passwordMismatch"));
      valid = false;
    } else {
      setConfirmError(null);
    }
    if (!valid) return;

    setLoading(true);
    try {
      await ResetPassword({ token, password, passwordConfirm: confirm });
      setDone(true);
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex flex-col gap-section">
        <AuthCardHeader title={t("title")} />
        <NoderaAlert variant="error" message={t("missingToken")} />
        <NoderaButton variant="filled" fullWidth onClick={() => navigate("/forgot-password")}>
          {t("requestNewLink")}
        </NoderaButton>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-section text-center">
        <CheckCircleFilled className="text-success" style={{ fontSize: 48 }} />
        <AuthCardHeader title={t("successTitle")} subtitle={t("successMessage")} />
        <NoderaButton
          variant="filled"
          fullWidth
          onClick={() => navigate("/login", { replace: true })}
        >
          {t("goToLogin")}
        </NoderaButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-section">
      <AuthCardHeader title={t("title")} subtitle={t("subtitle")} />

      {formError && <NoderaAlert variant="error" message={formError} />}

      <div className="flex flex-col gap-field">
        <div className="flex flex-col gap-2">
          <NoderaTextField
            label={t("password")}
            kind="password"
            value={password}
            onChange={setPassword}
            error={passwordError}
            autoComplete="new-password"
            autoFocus
            disabled={loading}
          />
          <PasswordChecklist password={password} />
        </div>
        <NoderaTextField
          label={t("passwordConfirm")}
          kind="password"
          value={confirm}
          onChange={setConfirm}
          error={confirmError}
          autoComplete="new-password"
          onEnter={handleSubmit}
          disabled={loading}
        />
      </div>

      <NoderaButton variant="filled" fullWidth loading={loading} onClick={handleSubmit}>
        {t("submit")}
      </NoderaButton>

      <p className="text-center text-sm">
        <NoderaLink href="/login" muted>
          {t("backToLogin")}
        </NoderaLink>
      </p>
    </div>
  );
}
