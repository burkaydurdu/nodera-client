export type ProjectTabKey = "general" | "apiKeys";

export interface ProjectTabsProps {
  active: ProjectTabKey;
  /** `apikey.write` (owners and developers); finance never sees the API keys tab. */
  showApiKeys: boolean;
  onChange: (key: ProjectTabKey) => void;
}
