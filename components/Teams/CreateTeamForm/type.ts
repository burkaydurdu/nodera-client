import type { TeamCreatedHandler } from "../type";

export interface CreateTeamFormProps {
  onCreated: TeamCreatedHandler;
  onCancel?: () => void;
  autoFocus?: boolean;
}
