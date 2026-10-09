import type { Upload } from "@/hooks/Storage/useUploads";

export interface UploadPanelProps {
  uploads: Upload[];
  /** At least one upload the browser refused to send: the restore is offered. */
  hasBlocked: boolean;
  /** The restore of browser access is in flight. */
  restoring: boolean;
  onRestoreAccess: () => void;
  onRetryFailed: () => void;
  onClear: () => void;
}
