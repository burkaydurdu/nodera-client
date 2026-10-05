import type { SendingDomainCreatedHandler } from "../type";

export interface AddSendingDomainModalProps {
  open: boolean;
  projectId: string;
  existingNames: string[];
  onClose: () => void;
  onCreated: SendingDomainCreatedHandler;
}
