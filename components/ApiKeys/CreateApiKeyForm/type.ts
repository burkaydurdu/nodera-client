import type { ApiKeyCreatedHandler } from "../type";

export interface CreateApiKeyFormProps {
  teamId: string;
  projectId: string;
  onCreated: ApiKeyCreatedHandler;
  onCancel?: () => void;
  autoFocus?: boolean;
}
