import type { SSHKey } from "@/core/sshKey";

/** Shared by the SSH key feature components. */
export interface SSHKeyCreatedHandler {
  (key: SSHKey): void;
}
