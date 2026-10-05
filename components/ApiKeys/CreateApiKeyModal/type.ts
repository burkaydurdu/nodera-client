import type { ApiKeyCreatedHandler } from "../type";

export interface CreateApiKeyModalProps {
  open: boolean;
  teamId: string;
  projectId: string;
  onClose: () => void;
  onCreated: ApiKeyCreatedHandler;
}
