import APIClient from "./client";
import type {
  ChangePasswordPayload,
  UpdateMfaPayload,
  UpdateProfilePayload,
  User,
  UserSession,
} from "@/core/user";

export const GetMe = () => APIClient.get<User>("/v1/users/me");

export const UpdateMe = (payload: UpdateProfilePayload) =>
  APIClient.put<User>("/v1/users/me", payload);

export const ChangePassword = (payload: ChangePasswordPayload) =>
  APIClient.post<void>("/v1/users/me/password", payload);

export const UpdateMfa = (payload: UpdateMfaPayload) =>
  APIClient.put<User>("/v1/users/me/mfa", payload);

export const GetSessions = () => APIClient.get<UserSession[]>("/v1/users/me/sessions");

export const DeleteSession = (sessionId: string) =>
  APIClient.delete<void>(`/v1/users/me/sessions/${sessionId}`);
