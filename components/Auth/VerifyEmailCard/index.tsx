"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ResendVerifyEmail, VerifyEmail } from "@/api/auth";
import { CODE_LENGTH, VERIFY_EMAIL_RESEND_SECONDS } from "@/core/auth";
import { isValidEmail } from "@/core/validation";
import useAuth from "@/contexts/AuthContext/useAuth";
import { useNavigate } from "@/hooks/Navigation/useNavigate";
import { useCountdown } from "@/hooks/Countdown/useCountdown";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { GetRetryAfterSeconds } from "@/utils/error";
import AuthCardHeader from "@/components/Auth/AuthCardHeader";
import CodeInput from "@/components/CodeInput";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import NoderaLink from "@/components/NoderaLink";
import NoderaTextField from "@/components/NoderaTextField";
import type { VerifyEmailCardProps } from "./type";

export default function VerifyEmailCard({
  initialEmail = "",
  codeJustSent = false,
}: VerifyEmailCardProps) {
  const t = useTranslations("auth.verifyEmail");
  const tv = useTranslations("validation");
  const { setSession } = useAuth();
  const { navigate } = useNavigate();
  const { getErrorMessage } = useErrorMessage();
  const resend = useCountdown(codeJustSent ? VERIFY_EMAIL_RESEND_SECONDS : 0);

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    setEmail(initialEmail);
  }, [initialEmail]);

  const validateEmail = (): string | null => {
    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError(tv("emailRequired"));
      return null;
    }
    if (!isValidEmail(trimmed)) {
      setEmailError(tv("emailInvalid"));
      return null;
    }
    setEmailError(null);
    return trimmed;
  };

  const handleVerify = async (value: string = code) => {
    if (loading) return;
    setError(null);
    setInfo(null);
    const trimmedEmail = validateEmail();
    if (!trimmedEmail) return;
    if (value.length !== CODE_LENGTH) {
      setError(tv("codeInvalidLength", { length: CODE_LENGTH }));
      return;
    }

    setLoading(true);
    try {
      const response = await VerifyEmail({ email: trimmedEmail, code: value });
      await setSession(response.data);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
      setCode("");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resending || resend.active) return;
    setError(null);
    setInfo(null);
    const trimmedEmail = validateEmail();
    if (!trimmedEmail) return;

    setResending(true);
    try {
      await ResendVerifyEmail(trimmedEmail);
      resend.start(VERIFY_EMAIL_RESEND_SECONDS);
      setInfo(t("resendSent"));
    } catch (err) {
      const retryAfter = GetRetryAfterSeconds(err);
      if (retryAfter != null) resend.start(retryAfter);
      setError(getErrorMessage(err));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex flex-col gap-section">
      <AuthCardHeader title={t("title")} subtitle={t("subtitle")} />

      {error && <NoderaAlert variant="error" message={error} />}
      {info && <NoderaAlert variant="success" message={info} />}

      <div className="flex flex-col gap-field">
        <NoderaTextField
          label={t("email")}
          kind="email"
          value={email}
          onChange={setEmail}
          error={emailError}
          autoComplete="email"
          disabled={loading}
        />
        <div className="flex flex-col gap-2">
          <span className="text-center text-sm font-medium text-text">{t("code")}</span>
          <CodeInput
            value={code}
            onChange={setCode}
            onComplete={(value) => handleVerify(value)}
            disabled={loading}
            error={!!error}
            autoFocus={!!initialEmail}
          />
        </div>
      </div>

      <NoderaButton
        variant="filled"
        fullWidth
        loading={loading}
        onClick={() => handleVerify()}
      >
        {t("submit")}
      </NoderaButton>

      <div className="flex flex-col items-center gap-2 text-sm">
        <button
          type="button"
          onClick={handleResend}
          disabled={resend.active || resending}
          className="font-medium text-brand-600 hover:text-brand-700 disabled:cursor-not-allowed disabled:text-text-muted"
        >
          {resend.active ? t("resendIn", { seconds: resend.seconds }) : t("resend")}
        </button>
        <NoderaLink href="/login" muted>
          {t("backToLogin")}
        </NoderaLink>
      </div>
    </div>
  );
}
