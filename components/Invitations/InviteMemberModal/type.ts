import type { InvitationCreatedHandler } from "../type";

export interface InviteMemberModalProps {
  open: boolean;
  teamId: string;
  onClose: () => void;
  onCreated: InvitationCreatedHandler;
}
