"use client";

import { useState } from "react";
import { Badge, Dropdown } from "antd";
import { BellOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import useInbox from "@/contexts/InboxContext/useInbox";
import NotificationPanel from "@/components/Notifications/NotificationPanel";

/** Navbar bell: the unread count of the whole Inbox, every Team included, and its panel. */
export default function NotificationBell() {
  const t = useTranslations("notifications");
  const { unreadCount } = useInbox();
  const [open, setOpen] = useState(false);

  return (
    <Dropdown
      open={open}
      onOpenChange={setOpen}
      trigger={["click"]}
      placement="bottomRight"
      popupRender={() => <NotificationPanel open={open} onClose={() => setOpen(false)} />}
    >
      <button
        type="button"
        aria-label={t("label")}
        className="flex size-10 items-center justify-center rounded-button text-text-muted hover:bg-surface-raised hover:text-text"
      >
        <Badge count={unreadCount} size="small" offset={[2, -2]} overflowCount={99}>
          <BellOutlined className="text-lg" />
        </Badge>
      </button>
    </Dropdown>
  );
}
