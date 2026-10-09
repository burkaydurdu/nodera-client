export type ClusterTabKey = "overview" | "settings";

export interface ClusterTabsProps {
  active: ClusterTabKey;
  onChange: (key: ClusterTabKey) => void;
}
