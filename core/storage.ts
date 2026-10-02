import type { PendingCardVerification, PendingPaymentConfirmation } from "./billing";
import type { PendingInvitation } from "./invitation";
import type { Session, MfaChallenge } from "./session";

export const ACCESS_TOKEN_KEY = "nodera.access_token";
export const REFRESH_TOKEN_KEY = "nodera.refresh_token";
export const LAST_TEAM_ID_KEY = "nodera.last_team_id";
export const LAST_PROJECT_ID_KEY = "nodera.last_project_id";
export const MFA_CHALLENGE_KEY = "nodera.mfa_challenge";
export const PENDING_INVITATION_KEY = "nodera.pending_invitation";
export const CARD_VERIFICATION_KEY = "nodera.card_verification";
export const PAYMENT_CONFIRMATION_KEY = "nodera.payment_confirmation";

const hasWindow = () => typeof window !== "undefined";

export function getAccessToken(): string | null {
  if (!hasWindow()) return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (!hasWindow()) return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function storeSession(session: Session): void {
  if (!hasWindow()) return;
  localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
}

export function clearSession(): void {
  if (!hasWindow()) return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getLastTeamId(): string | null {
  if (!hasWindow()) return null;
  return localStorage.getItem(LAST_TEAM_ID_KEY);
}

export function setLastTeamId(teamId: string): void {
  if (!hasWindow()) return;
  localStorage.setItem(LAST_TEAM_ID_KEY, teamId);
}

export function clearLastTeamId(): void {
  if (!hasWindow()) return;
  localStorage.removeItem(LAST_TEAM_ID_KEY);
}

export function getLastProjectId(): string | null {
  if (!hasWindow()) return null;
  return localStorage.getItem(LAST_PROJECT_ID_KEY);
}

export function setLastProjectId(projectId: string): void {
  if (!hasWindow()) return;
  localStorage.setItem(LAST_PROJECT_ID_KEY, projectId);
}

export function clearLastProjectId(): void {
  if (!hasWindow()) return;
  localStorage.removeItem(LAST_PROJECT_ID_KEY);
}

export function getMfaChallenge(): MfaChallenge | null {
  if (!hasWindow()) return null;
  const raw = sessionStorage.getItem(MFA_CHALLENGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as MfaChallenge;
  } catch {
    return null;
  }
}

export function setMfaChallenge(challenge: MfaChallenge): void {
  if (!hasWindow()) return;
  sessionStorage.setItem(MFA_CHALLENGE_KEY, JSON.stringify(challenge));
}

export function clearMfaChallenge(): void {
  if (!hasWindow()) return;
  sessionStorage.removeItem(MFA_CHALLENGE_KEY);
}

export function getPendingInvitation(): PendingInvitation | null {
  if (!hasWindow()) return null;
  const raw = sessionStorage.getItem(PENDING_INVITATION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingInvitation;
  } catch {
    return null;
  }
}

export function setPendingInvitation(invitation: PendingInvitation): void {
  if (!hasWindow()) return;
  sessionStorage.setItem(PENDING_INVITATION_KEY, JSON.stringify(invitation));
}

export function clearPendingInvitation(): void {
  if (!hasWindow()) return;
  sessionStorage.removeItem(PENDING_INVITATION_KEY);
}

export function getPendingCardVerification(): PendingCardVerification | null {
  if (!hasWindow()) return null;
  const raw = sessionStorage.getItem(CARD_VERIFICATION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingCardVerification;
  } catch {
    return null;
  }
}

export function setPendingCardVerification(verification: PendingCardVerification): void {
  if (!hasWindow()) return;
  sessionStorage.setItem(CARD_VERIFICATION_KEY, JSON.stringify(verification));
}

export function clearPendingCardVerification(): void {
  if (!hasWindow()) return;
  sessionStorage.removeItem(CARD_VERIFICATION_KEY);
}

export function getPendingPaymentConfirmation(): PendingPaymentConfirmation | null {
  if (!hasWindow()) return null;
  const raw = sessionStorage.getItem(PAYMENT_CONFIRMATION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingPaymentConfirmation;
  } catch {
    return null;
  }
}

export function setPendingPaymentConfirmation(confirmation: PendingPaymentConfirmation): void {
  if (!hasWindow()) return;
  sessionStorage.setItem(PAYMENT_CONFIRMATION_KEY, JSON.stringify(confirmation));
}

export function clearPendingPaymentConfirmation(): void {
  if (!hasWindow()) return;
  sessionStorage.removeItem(PAYMENT_CONFIRMATION_KEY);
}
