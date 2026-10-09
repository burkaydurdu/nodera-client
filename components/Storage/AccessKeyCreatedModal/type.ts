import type { CreatedAccessKey, Storage } from "@/core/storageApp";

export interface AccessKeyCreatedModalProps {
  open: boolean;
  /** Null once the modal is gone and the secret dropped. */
  accessKey: CreatedAccessKey | null;
  /** The Storage the key reaches, for the connection details printed beside it. */
  storage: Storage;
  onClose: () => void;
  /** Runs once the modal is gone, so the secret can be dropped without blanking it mid-close. */
  afterClose: () => void;
}
