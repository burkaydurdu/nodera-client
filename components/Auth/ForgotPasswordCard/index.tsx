"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MailOutlined } from "@ant-design/icons";
import { ForgotPassword } from "@/api/auth";
import { isValidEmail } from "@/core/validation";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import AuthCardHeader from "@/components/Auth/AuthCardHeader";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import NoderaLink from "@/components/NoderaLink";
import NoderaTextField from "@/components/NoderaTextField";

export default function ForgotPasswordCard() {
  const t = useTranslations("auth.forgotPassword");
  const tv = useTranslations("validation");
  const { getErrorMessage } = useErrorMessage();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

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
      await ForgotPassword(trimmed);
      setSent(true);
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-section text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <MailOutlined style={{ fontSize: 26 }} />
        </div>
        <AuthCardHeader
          title={t("successTitle")}
          subtitle={t("successMessage", { email: email.trim() })}
        />
        <NoderaLink href="/login">{t("backToLogin")}</NoderaLink>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-section">
      <AuthCardHeader title={t("title")} subtitle={t("subtitle")} />

      {formError && <NoderaAlert variant="error" message={formError} />}

      <NoderaTextField
        label={t("email")}
        kind="email"
        value={email}
        onChange={setEmail}
        error={emailError}
        autoComplete="email"
        autoFocus
        onEnter={handleSubmit}
        disabled={loading}
      />

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
