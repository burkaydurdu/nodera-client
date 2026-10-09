export interface FileToolbarProps {
  /** `storage.write` on a writable Storage: upload and delete are offered. */
  canWrite: boolean;
  /** How many objects are ticked. */
  selectedCount: number;
  /** A delete is in flight. */
  deleting: boolean;
  onUpload: (files: File[]) => void;
  onDeleteSelected: () => void;
  onRefresh: () => void;
}
