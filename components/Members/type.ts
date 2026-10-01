import type { Member } from "@/core/member";
import type { TeamRole } from "@/core/user";

/** Shared by the member feature components. */
export interface MemberRoleChangeHandler {
  (member: Member, role: TeamRole): void;
}

export interface MemberActionHandler {
  (member: Member): void;
}
