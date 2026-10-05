"use client";

import { Tabs } from "antd";
import { useTranslations } from "next-intl";
import type { ProjectTabKey, ProjectTabsProps } from "./type";

/** The tabs of a Project's settings area, like the Team's. */
export default function ProjectTabs({ active, showApiKeys, onChange }: ProjectTabsProps) {
  const t = useTranslations("dashboard.projectSettings.tabs");

  const items = [
    { key: "general", label: t("general") },
    ...(showApiKeys ? [{ key: "apiKeys", label: t("apiKeys") }] : []),
  ];

  return (
    <Tabs
      activeKey={active}
      items={items}
      onChange={(key) => onChange(key as ProjectTabKey)}
      className="-mb-2"
    />
  );
}
