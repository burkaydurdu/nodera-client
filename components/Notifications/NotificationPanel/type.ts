export interface NotificationPanelProps {
  /** Whether the bell's dropdown is showing; each opening refetches the latest Notifications. */
  open: boolean;
  onClose: () => void;
}
