export interface SendApiCardProps {
  projectId: string;
  /** The Project's API keys page; null for a Role without `apikey.write`, told whom to ask. */
  apiKeysPath: string | null;
}
