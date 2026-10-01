import type { SSHKeyCreatedHandler } from "../type";

export interface AddSSHKeyFormProps {
  teamId: string;
  onCreated: SSHKeyCreatedHandler;
  onCancel?: () => void;
  autoFocus?: boolean;
}
