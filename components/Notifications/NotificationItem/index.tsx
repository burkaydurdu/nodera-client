"use client";

import type { ReactNode } from "react";
import {
  BellOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import classNames from "classnames";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { type NotificationTone, createdAtMs, notificationKind } from "@/core/notification";
import { useNotificationText } from "@/hooks/Notification/useNotificationText";
import { formatDateTime } from "@/utils/date";
import type { NotificationItemProps } from "./type";

const toneIcons: Record<NotificationTone, ReactNode> = {
  success: <CheckCircleOutlined />,
  error: <CloseCircleOutlined />,
  warning: <ExclamationCircleOutlined />,
  info: <BellOutlined />,
};

const toneClasses: Record<NotificationTone, string> = {
  success: "bg-success-soft text-success",
  error: "bg-danger-soft text-danger",
  warning: "bg-warning-soft text-warning",
  info: "bg-brand-50 text-brand-600",
};

export default function NotificationItem({
  notification,
  teamName,
  now,
  onOpen,
}: NotificationItemProps) {
  const t = useTranslations("notifications");
  const format = useFormatter();
  const locale = useLocale();
  const textOf = useNotificationText();
  const { title, description } = textOf(notification);
  const { tone } = notificationKind(notification);
  const unread = !notification.readAt;
  const created = createdAtMs(notification);
  // A browser clock a little behind the server's must not announce "in 3 seconds".
  const when = Number.isNaN(created)
    ? ""
    : format.relativeTime(Math.min(created, now.getTime()), now);

  return (
    <button
      type="button"
      onClick={() => onOpen(notification)}
      className={classNames(
        "flex w-full items-start gap-3 rounded-button px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300",
        unread ? "bg-brand-50/60 hover:bg-brand-50" : "hover:bg-surface-raised"
      )}
    >
      <span
        aria-hidden
        className={classNames(
          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full text-base",
          toneClasses[tone]
        )}
      >
        {toneIcons[tone]}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className={classNames(
            "break-words text-sm leading-5 text-text",
            unread ? "font-semibold" : "font-medium"
          )}
        >
          {title}
        </span>
        {description && (
          <span className="break-words text-sm leading-5 text-text-muted">{description}</span>
        )}
        <span className="flex min-w-0 items-center gap-2 text-xs leading-4 text-text-muted">
          {teamName && (
            <>
              <span className="truncate">{teamName}</span>
              <span aria-hidden className="h-2.5 w-px shrink-0 bg-border" />
            </>
          )}
          <time
            dateTime={notification.createdAt}
            title={formatDateTime(notification.createdAt, locale)}
            className="shrink-0"
          >
            {when}
          </time>
        </span>
      </span>
      {unread && (
        <span className="mt-2 size-2 shrink-0 rounded-full bg-brand-600">
          <span className="sr-only">{t("unread")}</span>
        </span>
      )}
    </button>
  );
}
