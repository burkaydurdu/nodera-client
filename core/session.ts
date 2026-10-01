import type { MfaMethod } from "./user";

export interface Session {
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: string;
  refreshExpiresAt: string;
  tokenType: "Bearer";
}

export interface LoginMfaRequiredResponse {
  mfaRequired: true;
  challengeToken: string;
  method: MfaMethod;
  supportsResend: boolean;
  resendAfterSeconds: number;
}

export interface LoginSessionResponse {
  mfaRequired: false;
  session: Session;
}

export type LoginResponse = LoginMfaRequiredResponse | LoginSessionResponse;

/** What /login stashes for /otp between two page loads. */
export interface MfaChallenge {
  challengeToken: string;
  method: MfaMethod;
  supportsResend: boolean;
  resendAfterSeconds: number;
  email: string;
}
