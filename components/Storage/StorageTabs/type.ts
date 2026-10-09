export type StorageTabKey = "files" | "access-keys" | "usage" | "settings";

export interface StorageTabsProps {
  active: StorageTabKey;
  onChange: (key: StorageTabKey) => void;
}
