import type { Session } from "@/core/session";
import type { User } from "@/core/user";

export interface LogoutOptions {
  /** Revoke every session of the user (logout-all) instead of only the current one. */
  everywhere?: boolean;
  /** Skip the API call — used when the server already ended the session. */
  silent?: boolean;
}

export interface AuthContextValues {
  currentUser: User | null;
  isLoading: boolean;
  setSession: (session: Session) => Promise<User | null>;
  logout: (options?: LogoutOptions) => Promise<void>;
  refreshUser: () => Promise<User | null>;
  setCurrentUser: (user: User) => void;
}
