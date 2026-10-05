import type { ReactNode } from "react";

export interface NoderaSecretModalProps {
  open: boolean;
  title: string;
  /** What the secret is and where it goes, above it. */
  description?: ReactNode;
  /** Shown in full this once, with a copy button. */
  secret: string;
  /** The "you will not see it again" notice under it. */
  warning: string;
  onClose: () => void;
  /** Runs once the modal is gone, so the secret can be dropped without blanking it mid-close. */
  afterClose?: () => void;
  /** What to do with the secret next (try it out), under the notice; widens the modal. */
  children?: ReactNode;
}
