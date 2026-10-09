"use client";

import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useLocale, useTranslations } from "next-intl";
import type { StorageUsageDay } from "@/core/storageApp";
import { formatUtcDate } from "@/utils/date";
import { formatCount, formatStorageSize } from "@/utils/number";
import type { UsageTrafficTableProps } from "./type";

/** The traffic in and out per UTC day, with the size the Storage had at the end of it. */
export default function UsageTrafficTable({ days }: UsageTrafficTableProps) {
  const t = useTranslations("storage.usage");
  const locale = useLocale();

  const peak = Math.max(1, ...days.map((day) => day.bytesSent + day.bytesReceived));

  const columns: ColumnsType<StorageUsageDay> = [
    {
      title: t("columns.day"),
      dataIndex: "day",
      key: "day",
      width: 140,
      render: (day: string) => formatUtcDate(day, locale),
    },
    {
      title: t("columns.traffic"),
      key: "traffic",
      render: (_value, day) => {
        const total = day.bytesSent + day.bytesReceived;
        return (
          <div className="flex min-w-32 flex-col gap-1">
            <div className="flex h-1.5 w-full overflow-hidden rounded-badge bg-surface-raised">
              <span
                className="bg-brand-600"
                style={{ width: `${(day.bytesSent / peak) * 100}%` }}
                aria-hidden
              />
              <span
                className="bg-brand-300"
                style={{ width: `${(day.bytesReceived / peak) * 100}%` }}
                aria-hidden
              />
            </div>
            <span className="text-xs text-text-muted">{formatStorageSize(total, locale)}</span>
          </div>
        );
      },
    },
    {
      title: t("columns.sent"),
      dataIndex: "bytesSent",
      key: "sent",
      width: 120,
      align: "right",
      render: (value: number) => (
        <span className="font-mono">{formatStorageSize(value, locale)}</span>
      ),
    },
    {
      title: t("columns.received"),
      dataIndex: "bytesReceived",
      key: "received",
      width: 120,
      align: "right",
      render: (value: number) => (
        <span className="font-mono">{formatStorageSize(value, locale)}</span>
      ),
    },
    {
      title: t("columns.requests"),
      dataIndex: "requests",
      key: "requests",
      width: 110,
      align: "right",
      render: (value: number) => (
        <span className="font-mono">{formatCount(value, locale)}</span>
      ),
    },
    {
      title: t("columns.size"),
      dataIndex: "usedBytes",
      key: "size",
      width: 120,
      align: "right",
      render: (value: number) => (
        <span className="font-mono">{formatStorageSize(value, locale)}</span>
      ),
    },
    {
      title: t("columns.objects"),
      dataIndex: "objectCount",
      key: "objects",
      width: 100,
      align: "right",
      render: (value: number) => (
        <span className="font-mono">{formatCount(value, locale)}</span>
      ),
    },
  ];

  return (
    <Table<StorageUsageDay>
      rowKey="day"
      columns={columns}
      dataSource={days}
      pagination={false}
      size="small"
      scroll={{ x: 860 }}
    />
  );
}
