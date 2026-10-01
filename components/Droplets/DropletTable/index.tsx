"use client";

import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useLocale, useTranslations } from "next-intl";
import type { Droplet } from "@/core/droplet";
import { formatDateTime } from "@/utils/date";
import DropletStatusBadge from "@/components/Droplets/DropletStatusBadge";
import NoderaCopyButton from "@/components/NoderaCopyButton";
import type { DropletTableProps } from "./type";

export default function DropletTable({
  droplets,
  loading = false,
  onOpen,
}: DropletTableProps) {
  const t = useTranslations("droplets.list");
  const locale = useLocale();

  const columns: ColumnsType<Droplet> = [
    {
      title: t("columns.hostname"),
      dataIndex: "hostname",
      key: "hostname",
      ellipsis: true,
      render: (hostname: string) => (
        <span className="font-mono text-sm font-medium text-brand-600">{hostname}</span>
      ),
    },
    {
      title: t("columns.status"),
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status: Droplet["status"]) => <DropletStatusBadge status={status} />,
    },
    { title: t("columns.region"), dataIndex: "regionCode", key: "region", width: 110 },
    {
      title: t("columns.plan"),
      dataIndex: "planCode",
      key: "plan",
      width: 150,
      render: (code: string) => <span className="font-mono text-sm">{code}</span>,
    },
    {
      title: t("columns.ipv4"),
      dataIndex: "ipv4",
      key: "ipv4",
      width: 190,
      render: (ipv4: string | null) =>
        ipv4 ? (
          <span className="flex items-center gap-1">
            <span className="font-mono text-sm">{ipv4}</span>
            <NoderaCopyButton value={ipv4} />
          </span>
        ) : (
          <span className="text-sm text-text-muted">{t("pendingIp")}</span>
        ),
    },
    {
      title: t("columns.created"),
      dataIndex: "createdAt",
      key: "created",
      width: 180,
      render: (value: string) => formatDateTime(value, locale),
    },
  ];

  return (
    <Table<Droplet>
      rowKey="id"
      columns={columns}
      dataSource={droplets}
      loading={loading}
      pagination={false}
      size="middle"
      scroll={{ x: 900 }}
      rowClassName={() => "cursor-pointer"}
      onRow={(droplet) => ({ onClick: () => onOpen(droplet) })}
    />
  );
}
