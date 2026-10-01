import type { Team } from "./team";
import type { TeamRole } from "./user";

export type InvitationStatus = "pending" | "accepted" | "declined" | "revoked" | "expired";

export interface InvitationInviter {
  userId: string;
  fullName: string;
}

export interface Invitation {
  id: string;
  teamId: string;
  teamName: string;
  email: string;
  role: TeamRole;
  invitedBy: InvitationInviter;
  status: InvitationStatus;
  expiresAt: string;
  createdAt: string;
  respondedAt: string | null;
}

/** Token-scoped public read: the invited address in full and masked (`b***@example.com`). */
export interface InvitationLookup {
  teamName: string;
  role: TeamRole;
  invitedByName: string;
  email: string;
  emailHint: string;
  status: InvitationStatus;
  expiresAt: string;
}

export interface CreateInvitationPayload {
  email: string;
  role: TeamRole;
}

export interface AcceptInvitationResponse {
  team: Team;
}

export interface InvitationTokenPayload {
  token: string;
}

/**
 * What an invitation link leaves behind for the rest of the sign-in flow (sessionStorage).
 * `autoAccepted` is true for a sign-up: the server accepts the Invitation when the email is
 * verified, so the app only has to select the Team by name once GET /v1/teams answers.
 */
export interface PendingInvitation {
  token: string;
  teamName: string;
  autoAccepted: boolean;
}

/** Server-side cooldown between two resends of one Invitation (429 + Retry-After). */
export const INVITATION_RESEND_COOLDOWN_SECONDS = 60;

export const INVITATION_QUERY_PARAM = "invitation";
export const INVITATION_TOKEN_QUERY_PARAM = "token";

export const acceptInvitationPath = (token: string) =>
  `/invitations/accept?${INVITATION_TOKEN_QUERY_PARAM}=${encodeURIComponent(token)}`;

export const loginWithInvitationPath = (token: string) =>
  `/login?${INVITATION_QUERY_PARAM}=${encodeURIComponent(token)}`;

export const registerWithInvitationPath = (token: string) =>
  `/register?${INVITATION_QUERY_PARAM}=${encodeURIComponent(token)}`;

export const isInvitationPending = (status: InvitationStatus): boolean => status === "pending";

/** Case-insensitive comparison of two addresses. */
export const sameEmail = (a: string, b: string): boolean =>
  a.trim().toLowerCase() === b.trim().toLowerCase();

/**
 * Fallback for a lookup without the full `email`: whether an address can be the one behind
 * a masked hint (`b***@example.com`), same domain and the same visible characters around the
 * stars. The server still decides (8-10003).
 */
export function matchesEmailHint(email: string, hint: string): boolean {
  const [local, domain] = email.trim().toLowerCase().split("@");
  const [hintLocal, hintDomain] = hint.trim().toLowerCase().split("@");
  if (!local || !domain || !hintLocal || !hintDomain) return false;
  if (domain !== hintDomain) return false;
  if (!hintLocal.includes("*")) return local === hintLocal;
  const head = hintLocal.slice(0, hintLocal.indexOf("*"));
  const tail = hintLocal.slice(hintLocal.lastIndexOf("*") + 1);
  return (
    local.startsWith(head) && local.endsWith(tail) && local.length >= head.length + tail.length
  );
}

/** Whether the signed-in address is the invited one; exact when the lookup carries `email`. */
export function matchesInvitationEmail(email: string, lookup: InvitationLookup): boolean {
  return lookup.email
    ? sameEmail(email, lookup.email)
    : matchesEmailHint(email, lookup.emailHint);
}
