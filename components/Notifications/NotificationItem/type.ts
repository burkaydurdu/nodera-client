import type { Notification } from "@/core/notification";

export interface NotificationItemProps {
  notification: Notification;
  /** The Notification's Team (`notificationTeamName`); null when there is none to name. */
  teamName: string | null;
  /** The clock the relative time is measured against; one ticking clock serves a whole list. */
  now: Date;
  onOpen: (notification: Notification) => void;
}
