import type { Notification } from "@/core/notification";

export interface NotificationListProps {
  /** Newest first, as the Inbox returns them. */
  notifications: Notification[];
  onOpen: (notification: Notification) => void;
  className?: string;
}
