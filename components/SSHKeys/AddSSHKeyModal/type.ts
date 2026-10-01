import type { SSHKeyCreatedHandler } from "../type";

export interface AddSSHKeyModalProps {
  open: boolean;
  teamId: string;
  onClose: () => void;
  onCreated: SSHKeyCreatedHandler;
}
