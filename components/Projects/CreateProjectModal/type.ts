import type { ProjectCreatedHandler } from "../type";

export interface CreateProjectModalProps {
  open: boolean;
  teamId: string;
  onClose: () => void;
  onCreated: ProjectCreatedHandler;
}
