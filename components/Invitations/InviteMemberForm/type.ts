import type { InvitationCreatedHandler } from "../type";

export interface InviteMemberFormProps {
  teamId: string;
  onCreated: InvitationCreatedHandler;
  onCancel?: () => void;
  autoFocus?: boolean;
}
