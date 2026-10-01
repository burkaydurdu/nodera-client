"use client";

import { Tabs } from "antd";
import { useTranslations } from "next-intl";
import type { TeamTabKey, TeamTabsProps } from "./type";

export default function TeamTabs({ active, showInvitations, onChange }: TeamTabsProps) {
  const t = useTranslations("teams.tabs");

  const items = [
    { key: "members", label: t("members") },
    ...(showInvitations ? [{ key: "invitations", label: t("invitations") }] : []),
    { key: "sshKeys", label: t("sshKeys") },
  ];

  return (
    <Tabs
      activeKey={active}
      items={items}
      onChange={(key) => onChange(key as TeamTabKey)}
      className="-mb-2"
    />
  );
}
