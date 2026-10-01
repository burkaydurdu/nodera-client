import type { ProjectCreatedHandler } from "../type";

export interface CreateProjectFormProps {
  teamId: string;
  onCreated: ProjectCreatedHandler;
  onCancel?: () => void;
  /** Focus the name field when mounted (modals, first-project step). */
  autoFocus?: boolean;
}
