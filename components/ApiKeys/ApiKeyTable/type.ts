import type { ApiKey } from "@/core/apiKey";
import type { Member } from "@/core/member";

export interface ApiKeyTableProps {
  keys: ApiKey[];
  /** The Team's members, to name each key's creator; null when they could not be read. */
  members: Member[] | null;
  /** The signed-in user, marked as such among the creators. */
  currentUserId: string | null;
  /** Id of the key whose revocation is in flight. */
  revokingId?: string | null;
  onRevoke: (key: ApiKey) => void;
}
