"use client";

import { Tabs } from "antd";
import { useTranslations } from "next-intl";
import type { ClusterTabKey, ClusterTabsProps } from "./type";

const TAB_KEYS: ClusterTabKey[] = ["overview", "settings"];

/** The pages of one Cluster; every member may see them both, writes are gated inside. */
export default function ClusterTabs({ active, onChange }: ClusterTabsProps) {
  const t = useTranslations("kubernetes.tabs");

  return (
    <Tabs
      activeKey={active}
      items={TAB_KEYS.map((key) => ({ key, label: t(key) }))}
      onChange={(key) => onChange(key as ClusterTabKey)}
      className="-mb-2"
    />
  );
}
