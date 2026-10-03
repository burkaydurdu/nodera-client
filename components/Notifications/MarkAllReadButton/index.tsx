"use client";

import { useState } from "react";
import { App } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import useInbox from "@/contexts/InboxContext/useInbox";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import NoderaButton from "@/components/NoderaButton";
import type { MarkAllReadButtonProps } from "./type";

/** Marks the whole Inbox read, across every Team; idle while nothing is unread. */
export default function MarkAllReadButton({
  variant = "text",
  size = "small",
  className,
}: MarkAllReadButtonProps) {
  const t = useTranslations("notifications");
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessage();
  const { unreadCount, markAllRead } = useInbox();
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    setBusy(true);
    try {
      await markAllRead();
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <NoderaButton
      variant={variant}
      size={size}
      icon={<CheckOutlined />}
      loading={busy}
      disabled={unreadCount === 0}
      onClick={handleClick}
      className={className}
    >
      {t("markAllRead")}
    </NoderaButton>
  );
}
