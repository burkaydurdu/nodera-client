import type { User } from "@/core/user";
import type { UserUpdatedHandler } from "../type";

export interface ProfileDetailsFormProps {
  user: User;
  onUpdated: UserUpdatedHandler;
}
