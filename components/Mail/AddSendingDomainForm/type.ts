import type { SendingDomainCreatedHandler } from "../type";

export interface AddSendingDomainFormProps {
  projectId: string;
  /** The Project's Sending domains, so a duplicate is caught before the request. */
  existingNames: string[];
  onCreated: SendingDomainCreatedHandler;
  onCancel?: () => void;
  autoFocus?: boolean;
}
