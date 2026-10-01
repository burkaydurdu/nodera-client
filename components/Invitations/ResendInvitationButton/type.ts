import type { Invitation } from "@/core/invitation";
import type { InvitationResendHandler } from "../type";

export interface ResendInvitationButtonProps {
  invitation: Invitation;
  onResend: InvitationResendHandler;
  disabled?: boolean;
}
