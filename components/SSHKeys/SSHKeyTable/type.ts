import type { SSHKey } from "@/core/sshKey";

export interface SSHKeyTableProps {
  keys: SSHKey[];
  loading?: boolean;
  /** Id of the key whose delete is in flight. */
  deletingId?: string | null;
  /** Absent when the Role lacks `sshkey.write`: the column is not rendered. */
  onDelete?: (key: SSHKey) => void;
}
