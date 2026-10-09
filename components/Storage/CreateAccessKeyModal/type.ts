import type { AccessKeyCreatedHandler } from "../type";

export interface CreateAccessKeyModalProps {
  open: boolean;
  projectId: string;
  storageId: string;
  onClose: () => void;
  onCreated: AccessKeyCreatedHandler;
}
