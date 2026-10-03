export interface NotificationToastBodyProps {
  description: string | null;
  /** The Notification's Team (`notificationTeamName`); null when there is none to name. */
  teamName: string | null;
}
