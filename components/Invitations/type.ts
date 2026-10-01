import type { Invitation } from "@/core/invitation";

/** Shared by the invitation feature components. */
export interface InvitationCreatedHandler {
  (invitation: Invitation): void;
}

export interface InvitationActionHandler {
  (invitation: Invitation): void;
}

/** Resolves once the server accepted the resend; rejects with the API error otherwise. */
export interface InvitationResendHandler {
  (invitation: Invitation): Promise<void>;
}
