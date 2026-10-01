import type { MfaMethod } from "@/core/user";

export interface MfaConfirmModalProps {
  open: boolean;
  /** The method the user is switching to. */
  targetMethod: MfaMethod;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: (password: string) => void;
}
