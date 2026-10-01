"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Login } from "@/api/auth";
import { ErrorCode } from "@/core/error";
import { isValidEmail } from "@/core/validation";
import { setMfaChallenge } from "@/core/storage";
import useAuth from "@/contexts/AuthContext/useAuth";
import { useNavigate } from "@/hooks/Navigation/useNavigate";
import { useCountdown } from "@/hooks/Countdown/useCountdown";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { GetRetryAfterSeconds, IsErrorCode } from "@/utils/error";
import AuthCardHeader from "@/components/Auth/AuthCardHeader";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import NoderaLink from "@/components/NoderaLink";
import NoderaTextField from "@/components/NoderaTextField";

export default function LoginCard() {
  const t = useTranslations("auth.login");
  const tv = useTranslations("validation");
  const { setSession } = useAuth();
  const { navigate } = useNavigate();
  const { getErrorMessage } = useErrorMessage();
  const lock = useCountdown(0);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const wasLocked = useRef(false);

  // When the lock countdown ends the stale "try again in N s" message goes with it.
  useEffect(() => {
    if (lock.active) {
      wasLocked.current = true;
    } else if (wasLocked.current) {
      wasLocked.current = false;
      setFormError(null);
    }
  }, [lock.active]);

  const validate = (): boolean => {
    let valid = true;
    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError(tv("emailRequired"));
      valid = false;
    } else if (!isValidEmail(trimmed)) {
      setEmailError(tv("emailInvalid"));
      valid = false;
    } else {
      setEmailError(null);
    }
    if (!password) {
      setPasswordError(tv("passwordRequired"));
      valid = false;
    } else {
      setPasswordError(null);
    }
    return valid;
  };

  const handleSubmit = async () => {
    if (loading || lock.active) return;
    setFormError(null);
    if (!validate()) return;

    const trimmedEmail = email.trim();
    setLoading(true);
    try {
      const response = await Login({ email: trimmedEmail, password });
      const data = response.data;
      if (data.mfaRequired) {
        setMfaChallenge({
          challengeToken: data.challengeToken,
          method: data.method,
          supportsResend: data.supportsResend,
          resendAfterSeconds: data.resendAfterSeconds,
          email: trimmedEmail,
        });
        navigate("/otp");
        return;
      }
      await setSession(data.session);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      if (IsErrorCode(error, ErrorCode.UserEmailNotVerified)) {
        navigate(`/verify-email?email=${encodeURIComponent(trimmedEmail)}`);
        return;
      }
      const retryAfter = GetRetryAfterSeconds(error);
      if (retryAfter != null) {
        lock.start(retryAfter);
      }
      setFormError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-section">
      <AuthCardHeader title={t("title")} subtitle={t("subtitle")} />

      {formError && (
        <NoderaAlert
          variant="error"
          message={lock.active ? t("lockedFor", { seconds: lock.seconds }) : formError}
        />
      )}

      <div className="flex flex-col gap-field">
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
        <NoderaTextField
          label={t("password")}
          kind="password"
          value={password}
          onChange={setPassword}
          error={passwordError}
          autoComplete="current-password"
          onEnter={handleSubmit}
          disabled={loading}
        />
        <div className="flex justify-end">
          <NoderaLink href="/forgot-password" className="text-sm">
            {t("forgotPassword")}
          </NoderaLink>
        </div>
      </div>

      <NoderaButton
        variant="filled"
        fullWidth
        loading={loading}
        disabled={lock.active}
        onClick={handleSubmit}
      >
        {lock.active ? t("lockedFor", { seconds: lock.seconds }) : t("submit")}
      </NoderaButton>

      <p className="text-center text-sm text-text-muted">
        {t("noAccount")} <NoderaLink href="/register">{t("register")}</NoderaLink>
      </p>
    </div>
  );
}
