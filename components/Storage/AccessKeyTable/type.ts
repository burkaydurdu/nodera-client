import type { AccessKey } from "@/core/storageApp";
import type { AccessKeyRevokeHandler } from "../type";

export interface AccessKeyTableProps {
  accessKeys: AccessKey[];
  /** The user's own id, so a key they made says "you" instead of an id. */
  currentUserId: string | null;
  /** `storage.write` on a Storage that is not being deleted; without it no revoke button. */
  canRevoke: boolean;
  /** The key whose revocation is in flight. */
  busyId: string | null;
  onRevoke: AccessKeyRevokeHandler;
}
