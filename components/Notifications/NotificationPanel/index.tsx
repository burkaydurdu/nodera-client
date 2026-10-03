"use client";

import type { ReactNode } from "react";
import { Spin } from "antd";
import { useTranslations } from "next-intl";
import { NOTIFICATIONS_PATH, type Notification } from "@/core/notification";
import useInbox from "@/contexts/InboxContext/useInbox";
import { useNotificationList } from "@/hooks/Notification/useNotificationList";
import MarkAllReadButton from "@/components/Notifications/MarkAllReadButton";
import NotificationList from "@/components/Notifications/NotificationList";
import NoderaButton from "@/components/NoderaButton";
import NoderaLink from "@/components/NoderaLink";
import type { NotificationPanelProps } from "./type";

/** The bell shows this many of the latest Notifications; the Inbox page pages through the rest. */
const PANEL_SIZE = 20;

/** The bell's dropdown. Opening it reads nothing: only clicking an item or "mark all" does. */
export default function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const t = useTranslations("notifications");
  const { open: openNotification } = useInbox();
  const { notifications, isLoading, error, reload } = useNotificationList({
    pageSize: PANEL_SIZE,
    enabled: open,
  });
  // Pushes are prepended while the panel is open; it still shows only the latest ones.
  const latest = notifications.slice(0, PANEL_SIZE);

  const handleOpen = (notification: Notification) => {
    onClose();
    openNotification(notification);
  };

  let body: ReactNode;
  if (latest.length > 0) {
    body = <NotificationList notifications={latest} onOpen={handleOpen} />;
  } else if (isLoading) {
    body = (
      <div className="flex justify-center py-10">
        <Spin />
      </div>
    );
  } else if (error) {
    body = (
      <div className="flex flex-col items-center gap-3 px-3 py-6 text-center">
        <p className="text-sm text-text-muted">{error}</p>
        <NoderaButton variant="outlined" size="small" onClick={() => void reload()}>
          {t("retry")}
        </NoderaButton>
      </div>
    );
  } else {
    body = <p className="px-3 py-10 text-center text-sm text-text-muted">{t("empty")}</p>;
  }

  return (
    <div className="flex w-[380px] max-w-[calc(100vw-2rem)] flex-col rounded-card border border-border bg-surface shadow-card">
      <div className="flex items-center justify-between gap-3 border-b border-border py-2 pl-4 pr-2">
        <p className="text-sm font-semibold text-text">{t("label")}</p>
        <MarkAllReadButton />
      </div>
      <div className="max-h-[420px] overflow-y-auto p-2">{body}</div>
      {/* The link navigates first; the click then bubbles here and closes the dropdown. */}
      <div
        className="flex justify-center border-t border-border p-3 text-sm"
        onClick={onClose}
      >
        <NoderaLink href={NOTIFICATIONS_PATH}>{t("seeAll")}</NoderaLink>
      </div>
    </div>
  );
}
