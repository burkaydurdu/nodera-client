"use client";

import { useState } from "react";
import { App } from "antd";
import { useTranslations } from "next-intl";
import { INVITATION_RESEND_COOLDOWN_SECONDS } from "@/core/invitation";
import { useCountdown } from "@/hooks/Countdown/useCountdown";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { GetRetryAfterSeconds } from "@/utils/error";
import NoderaButton from "@/components/NoderaButton";
import type { ResendInvitationButtonProps } from "./type";

/** Resend with its own cooldown: the server's Retry-After (429) or the known 60 s after a send. */
export default function ResendInvitationButton({
  invitation,
  onResend,
  disabled = false,
}: ResendInvitationButtonProps) {
  const t = useTranslations("invitations");
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessage();
  const cooldown = useCountdown(0);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading || cooldown.active) return;
    setLoading(true);
    try {
      await onResend(invitation);
      cooldown.start(INVITATION_RESEND_COOLDOWN_SECONDS);
      message.success(t("resent", { email: invitation.email }));
    } catch (err) {
      const retryAfter = GetRetryAfterSeconds(err);
      if (retryAfter != null) cooldown.start(retryAfter);
      message.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <NoderaButton
      variant="text"
      size="small"
      onClick={handleClick}
      loading={loading}
      disabled={disabled || cooldown.active}
    >
      {cooldown.active ? t("resendIn", { seconds: cooldown.seconds }) : t("resend")}
    </NoderaButton>
  );
}
