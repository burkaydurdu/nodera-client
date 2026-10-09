import type { StorageObject } from "@/core/storageApp";

/** A folder or an object, as one row of the browser. */
export type FileRow =
  { kind: "folder"; key: string } | { kind: "object"; key: string; object: StorageObject };

export interface FileTableProps {
  /** Where the Storage answers; an object's URL is its key under it. */
  bucketUrl: string;
  folders: string[];
  objects: StorageObject[];
  /** Object keys ticked for a delete. */
  selectedKeys: string[];
  onSelectionChange: (keys: string[]) => void;
  /** `storage.write` on a writable Storage: rows get checkboxes. */
  selectable: boolean;
  /** `storage.read` on a Storage that answers: objects get a download button. */
  downloadable: boolean;
  /** The object whose download URL is being fetched. */
  downloadingKey: string | null;
  onOpenFolder: (prefix: string) => void;
  onDownload: (object: StorageObject) => void;
  /** What is known about each object's access: true published, false private, absent not read yet. */
  access: Record<string, boolean>;
  /** Hovering a row reads its access once. */
  onHoverObject: (object: StorageObject) => void;
  /** `storage.write`: the switch may be moved. */
  publishable: boolean;
  /** The object whose access is being changed. */
  togglingKey: string | null;
  onToggleAccess: (object: StorageObject, isPublic: boolean) => void;
}
