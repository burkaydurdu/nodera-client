import type { TeamCreatedHandler } from "../type";

export interface CreateTeamModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: TeamCreatedHandler;
}
