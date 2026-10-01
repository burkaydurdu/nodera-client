"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ResendMfa, VerifyMfa } from "@/api/auth";
import { CODE_LENGTH } from "@/core/auth";
import type { MfaChallenge } from "@/core/session";
import { clearMfaChallenge, getMfaChallenge } from "@/core/storage";
import useAuth from "@/contexts/AuthContext/useAuth";
import { useAfterSignIn } from "@/hooks/Auth/useAfterSignIn";
import { useNavigate } from "@/hooks/Navigation/useNavigate";
import { useCountdown } from "@/hooks/Countdown/useCountdown";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { GetRetryAfterSeconds } from "@/utils/error";
import AuthCardHeader from "@/components/Auth/AuthCardHeader";
import CodeInput from "@/components/CodeInput";
import Loading from "@/components/Loading";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";

export default function OTPCard() {
  const t = useTranslations("auth.otp");
  const tv = useTranslations("validation");
  const { setSession } = useAuth();
  const { navigate } = useNavigate();
  const afterSignIn = useAfterSignIn();
  const { getErrorMessage } = useErrorMessage();
  const resend = useCountdown(0);

  const [challenge, setChallenge] = useState<MfaChallenge | null>(null);
  const [ready, setReady] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const stored = getMfaChallenge();
    if (!stored) {
      navigate("/login", { replace: true });
      return;
    }
    setChallenge(stored);
    resend.start(stored.resendAfterSeconds);
    setReady(true);
  }, []);

  const backToLogin = () => {
    clearMfaChallenge();
    navigate("/login", { replace: true });
  };

  const handleVerify = async (value: string = code) => {
    if (loading || !challenge) return;
    setError(null);
    setInfo(null);
    if (value.length !== CODE_LENGTH) {
      setError(tv("codeInvalidLength", { length: CODE_LENGTH }));
      return;
    }

    setLoading(true);
    try {
      const response = await VerifyMfa({
        challengeToken: challenge.challengeToken,
        code: value,
      });
      await setSession(response.data);
      afterSignIn();
    } catch (err) {
      setError(getErrorMessage(err));
      setCode("");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!challenge || resending || resend.active || !challenge.supportsResend) return;
    setError(null);
    setInfo(null);
    setResending(true);
    try {
      await ResendMfa(challenge.challengeToken);
      resend.start(challenge.resendAfterSeconds || 60);
      setInfo(t("resendSent"));
    } catch (err) {
      const retryAfter = GetRetryAfterSeconds(err);
      if (retryAfter != null) resend.start(retryAfter);
      setError(getErrorMessage(err));
    } finally {
      setResending(false);
    }
  };

  if (!ready || !challenge) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col gap-section">
      <AuthCardHeader
        title={t("title")}
        subtitle={
          challenge.method === "email"
            ? t("subtitleEmail", { email: challenge.email })
            : t("subtitleGeneric")
        }
      />

      {error && <NoderaAlert variant="error" message={error} />}
      {info && <NoderaAlert variant="success" message={info} />}

      <div className="flex flex-col gap-2">
        <span className="text-center text-sm font-medium text-text">{t("code")}</span>
        <CodeInput
          value={code}
          onChange={setCode}
          onComplete={(value) => handleVerify(value)}
          disabled={loading}
          error={!!error}
          autoFocus
        />
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
        {challenge.supportsResend ? (
          <button
            type="button"
            onClick={handleResend}
            disabled={resend.active || resending}
            className="font-medium text-brand-600 hover:text-brand-700 disabled:cursor-not-allowed disabled:text-text-muted"
          >
            {resend.active ? t("resendIn", { seconds: resend.seconds }) : t("resend")}
          </button>
        ) : (
          <span className="text-text-muted">{t("resendUnsupported")}</span>
        )}
        <button
          type="button"
          onClick={backToLogin}
          className="font-medium text-text-muted hover:text-text hover:underline"
        >
          {t("backToLogin")}
        </button>
      </div>
    </div>
  );
}
