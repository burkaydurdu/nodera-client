"use client";

import classNames from "classnames";
import { useNow } from "next-intl";
import { notificationTeamName } from "@/core/notification";
import useTeam from "@/contexts/TeamContext/useTeam";
import NotificationItem from "@/components/Notifications/NotificationItem";
import type { NotificationListProps } from "./type";

/** Relative times move on while the list stays open. */
const CLOCK_INTERVAL_MS = 60_000;

/** Inbox rows across every Team; each names its Team. */
export default function NotificationList({
  notifications,
  onOpen,
  className,
}: NotificationListProps) {
  const { teams } = useTeam();
  const now = useNow({ updateInterval: CLOCK_INTERVAL_MS });

  return (
    <ul className={classNames("flex flex-col gap-1", className)}>
      {notifications.map((notification) => (
        <li key={notification.id}>
          <NotificationItem
            notification={notification}
            teamName={notificationTeamName(notification, teams)}
            now={now}
            onOpen={onOpen}
          />
        </li>
      ))}
    </ul>
  );
}
