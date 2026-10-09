"use client";

import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useLocale, useTranslations } from "next-intl";
import type { HeldStoragePackage, Storage, StorageState } from "@/core/storageApp";
import { formatStorageSize } from "@/utils/number";
import { formatUsd } from "@/utils/price";
import FullnessBar from "@/components/Storage/FullnessBar";
import StorageStateBadge from "@/components/Storage/StorageStateBadge";
import type { StorageTableProps } from "./type";

export default function StorageTable({ storages, onOpen }: StorageTableProps) {
  const t = useTranslations("storage.list");
  const locale = useLocale();

  const columns: ColumnsType<Storage> = [
    {
      title: t("columns.bucketName"),
      dataIndex: "bucketName",
      key: "bucketName",
      ellipsis: true,
      render: (name: string) => (
        <span className="truncate font-mono text-sm font-medium text-brand-600">{name}</span>
      ),
    },
    {
      title: t("columns.region"),
      dataIndex: "region",
      key: "region",
      width: 110,
      render: (region: string) => <span className="font-mono text-sm">{region}</span>,
    },
    {
      title: t("columns.package"),
      dataIndex: "package",
      key: "package",
      width: 170,
      render: (pkg: HeldStoragePackage) => (
        <span className="flex flex-col leading-tight">
          <span className="font-mono text-sm text-text">{pkg.code}</span>
          <span className="text-xs text-text-muted">
            {t("packageTerms", {
              size: formatStorageSize(pkg.sizeBytes, locale),
              price: formatUsd(pkg.monthlyPrice),
            })}
          </span>
        </span>
      ),
    },
    {
      title: t("columns.fullness"),
      key: "fullness",
      width: 220,
      render: (_value, storage) => (
        <FullnessBar
          usedBytes={storage.usedBytes}
          sizeBytes={storage.package.sizeBytes}
          compact
        />
      ),
    },
    {
      title: t("columns.state"),
      dataIndex: "state",
      key: "state",
      width: 140,
      render: (state: StorageState) => <StorageStateBadge state={state} />,
    },
  ];

  return (
    <Table<Storage>
      rowKey="id"
      columns={columns}
      dataSource={storages}
      pagination={false}
      size="middle"
      scroll={{ x: 820 }}
      rowClassName={() => "cursor-pointer"}
      onRow={(storage) => ({ onClick: () => onOpen(storage) })}
    />
  );
}
