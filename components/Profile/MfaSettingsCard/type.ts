import type { User } from "@/core/user";
import type { UserUpdatedHandler } from "../type";

export interface MfaSettingsCardProps {
  user: User;
  onUpdated: UserUpdatedHandler;
}
