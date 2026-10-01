import type { User } from "@/core/user";

/** Shared by the profile feature components. */
export interface UserUpdatedHandler {
  (user: User): void;
}
