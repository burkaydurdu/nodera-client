"use client";

import { Tabs } from "antd";
import { useTranslations } from "next-intl";
import type { StorageTabKey, StorageTabsProps } from "./type";

const TAB_KEYS: StorageTabKey[] = ["files", "access-keys", "usage", "settings"];

/** The pages of one Storage; every member may see them all, writes are gated inside. */
export default function StorageTabs({ active, onChange }: StorageTabsProps) {
  const t = useTranslations("storage.tabs");

  return (
    <Tabs
      activeKey={active}
      items={TAB_KEYS.map((key) => ({ key, label: t(key) }))}
      onChange={(key) => onChange(key as StorageTabKey)}
      className="-mb-2"
    />
  );
}
