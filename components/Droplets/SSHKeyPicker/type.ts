import type { SSHKey } from "@/core/sshKey";

export interface SSHKeyPickerProps {
  keys: SSHKey[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  /** Opens the inline "add key" modal owned by the form. */
  onAddKey: () => void;
  disabled?: boolean;
  error?: string | null;
}
