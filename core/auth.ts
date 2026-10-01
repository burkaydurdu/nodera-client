export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  country: string;
  locale: string;
  /** Present when signing up from an invitation link; the Invitation is accepted on verification. */
  invitationToken?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyEmailPayload {
  email: string;
  code: string;
}

export interface MfaVerifyPayload {
  challengeToken: string;
  code: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
  passwordConfirm: string;
}

/** Client-side resend cooldown for the email verification code (server enforces its own). */
export const VERIFY_EMAIL_RESEND_SECONDS = 60;
export const CODE_LENGTH = 6;
