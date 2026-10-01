import APIClient from "./client";
import type {
  AcceptInvitationResponse,
  CreateInvitationPayload,
  Invitation,
  InvitationLookup,
} from "@/core/invitation";

export const ListTeamInvitations = (teamId: string) =>
  APIClient.get<Invitation[]>(`/v1/teams/${teamId}/invitations`);

export const CreateInvitation = (teamId: string, payload: CreateInvitationPayload) =>
  APIClient.post<Invitation>(`/v1/teams/${teamId}/invitations`, payload);

export const ResendInvitation = (teamId: string, invitationId: string) =>
  APIClient.post<Invitation>(`/v1/teams/${teamId}/invitations/${invitationId}/resend`);

export const RevokeInvitation = (teamId: string, invitationId: string) =>
  APIClient.delete<void>(`/v1/teams/${teamId}/invitations/${invitationId}`);

export const ListMyInvitations = () => APIClient.get<Invitation[]>("/v1/users/me/invitations");

export const AcceptMyInvitation = (invitationId: string) =>
  APIClient.post<AcceptInvitationResponse>(`/v1/users/me/invitations/${invitationId}/accept`);

export const DeclineMyInvitation = (invitationId: string) =>
  APIClient.post<void>(`/v1/users/me/invitations/${invitationId}/decline`);

/** Public, token-scoped: works signed out and never triggers the refresh path on a 401. */
export const LookupInvitation = (token: string) =>
  APIClient.get<InvitationLookup>("/v1/invitations/lookup", { params: { token } });

export const AcceptInvitationByToken = (token: string) =>
  APIClient.post<AcceptInvitationResponse>("/v1/invitations/accept", { token });

export const DeclineInvitationByToken = (token: string) =>
  APIClient.post<void>("/v1/invitations/decline", { token });
