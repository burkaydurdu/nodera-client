import type { Team } from "@/core/team";

/** Shared by the team feature components. */
export interface TeamCreatedHandler {
  (team: Team): void;
}
