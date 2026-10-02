"use client";

import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useTranslations } from "next-intl";
import type { UsageLine } from "@/core/billing";
import { formatMoney } from "@/utils/price";
import type { UsageTableProps } from "./type";

export default function UsageTable({ lines, currency, loading = false }: UsageTableProps) {
  const t = useTranslations("billing.usage");

  const columns: ColumnsType<UsageLine> = [
    {
      title: t("columns.droplet"),
      dataIndex: "hostname",
      key: "hostname",
      ellipsis: true,
      render: (hostname: string) => (
        <span className="font-mono text-sm font-medium text-text">{hostname}</span>
      ),
    },
    {
      title: t("columns.plan"),
      dataIndex: "planCode",
      key: "plan",
      width: 150,
      render: (code: string) => <span className="font-mono text-sm">{code}</span>,
    },
    {
      title: t("columns.hours"),
      dataIndex: "hours",
      key: "hours",
      width: 110,
      align: "right",
      render: (hours: number) => t("hoursValue", { hours }),
    },
    {
      title: t("columns.hourlyPrice"),
      dataIndex: "hourlyPrice",
      key: "hourlyPrice",
      width: 150,
      align: "right",
      render: (price: string) => (
        <span className="font-mono text-sm">{formatMoney(price, currency)}</span>
      ),
    },
    {
      title: t("columns.amount"),
      dataIndex: "amount",
      key: "amount",
      width: 150,
      align: "right",
      render: (amount: string) => (
        <span className="font-mono text-sm font-medium text-text">
          {formatMoney(amount, currency)}
        </span>
      ),
    },
  ];

  return (
    <Table<UsageLine>
      rowKey="dropletId"
      columns={columns}
      dataSource={lines}
      loading={loading}
      pagination={false}
      size="middle"
      locale={{ emptyText: t("empty") }}
      scroll={{ x: 720 }}
    />
  );
}
