export interface FileBreadcrumbsProps {
  /** The Bucket name, as the root crumb. */
  bucketName: string;
  /** The folder on screen, ending in "/", or "" at the root. */
  prefix: string;
  onNavigate: (prefix: string) => void;
}
