import APIClient from "./client";
import type {
  LoginPayload,
  MfaVerifyPayload,
  RegisterPayload,
  ResetPasswordPayload,
  VerifyEmailPayload,
} from "@/core/auth";
import type { LoginResponse, Session } from "@/core/session";

export const Register = (payload: RegisterPayload) =>
  APIClient.post<void>("/v1/auth/register", payload);

export const VerifyEmail = (payload: VerifyEmailPayload) =>
  APIClient.post<Session>("/v1/auth/verify-email", payload);

export const ResendVerifyEmail = (email: string) =>
  APIClient.post<void>("/v1/auth/verify-email/resend", { email });

export const Login = (payload: LoginPayload) =>
  APIClient.post<LoginResponse>("/v1/auth/login", payload);

export const VerifyMfa = (payload: MfaVerifyPayload) =>
  APIClient.post<Session>("/v1/auth/mfa/verify", payload);

export const ResendMfa = (challengeToken: string) =>
  APIClient.post<void>("/v1/auth/mfa/resend", { challengeToken });

export const RefreshSession = (refreshToken: string) =>
  APIClient.post<Session>("/v1/auth/refresh", { refreshToken });

export const ForgotPassword = (email: string) =>
  APIClient.post<void>("/v1/auth/forgot-password", { email });

export const ResetPassword = (payload: ResetPasswordPayload) =>
  APIClient.post<void>("/v1/auth/reset-password", payload);

export const Logout = () => APIClient.post<void>("/v1/auth/logout");

export const LogoutAll = () => APIClient.post<void>("/v1/auth/logout-all");
