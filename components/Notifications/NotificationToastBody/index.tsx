import type { NotificationToastBodyProps } from "./type";

/** The lines under a pushed Notification's toast title; the Inbox spans Teams, so it names one. */
export default function NotificationToastBody({
  description,
  teamName,
}: NotificationToastBodyProps) {
  return (
    <span className="flex flex-col gap-0.5">
      {description && <span className="break-words text-sm text-text">{description}</span>}
      {teamName && <span className="text-xs text-text-muted">{teamName}</span>}
    </span>
  );
}
