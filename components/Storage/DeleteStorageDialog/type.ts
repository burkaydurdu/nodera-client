export interface DeleteStorageDialogProps {
  open: boolean;
  bucketName: string;
  loading: boolean;
  onClose: () => void;
  /** The name as typed; the service compares it again and refuses a mismatch (409). */
  onConfirm: (typedName: string) => void;
}
