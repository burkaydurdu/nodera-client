export interface MessageDetailDrawerProps {
  projectId: string;
  /** The Message to show; null closes the drawer. */
  messageId: string | null;
  onClose: () => void;
}
