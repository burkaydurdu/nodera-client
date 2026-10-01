import type { Member } from "@/core/member";
import type { MemberActionHandler, MemberRoleChangeHandler } from "../type";

export interface MemberTableProps {
  members: Member[];
  /** The signed-in user's id: their row gets Leave instead of Remove and no Role select. */
  currentUserId: string;
  /** Owners (`team.manage`) get the Role select and Remove on the other rows. */
  canManage: boolean;
  loading?: boolean;
  /** Id of the member whose change, removal or leave is in flight. */
  busyUserId?: string | null;
  onRoleChange: MemberRoleChangeHandler;
  onRemove: MemberActionHandler;
  onLeave: MemberActionHandler;
}
