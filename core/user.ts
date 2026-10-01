export type UserStatus = "pending_verification" | "active" | "suspended";
export type MfaMethod = "none" | "email";
export type TeamRole = "owner";

export interface TeamSummary {
  id: string;
  name: string;
  role: TeamRole;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  locale: string;
  country: string;
  status: UserStatus;
  mfaMethod: MfaMethod;
  emailVerifiedAt: string | null;
  createdAt: string;
  team: TeamSummary;
}

export interface UserSession {
  id: string;
  ip: string;
  userAgent: string;
  createdAt: string;
  lastUsedAt: string;
  expiresAt: string;
  current: boolean;
}

export interface UpdateProfilePayload {
  fullName: string;
  locale: string;
  country: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
}

export interface UpdateMfaPayload {
  method: MfaMethod;
  password: string;
}
