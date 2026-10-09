import type { AccessKeyCreatedHandler } from "../type";

export interface CreateAccessKeyFormProps {
  projectId: string;
  storageId: string;
  onCreated: AccessKeyCreatedHandler;
  onCancel?: () => void;
  autoFocus?: boolean;
}
