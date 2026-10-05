"use client";

import { Table } from "antd";
import { useTranslations } from "next-intl";
import { type UsageLine, billingLineKey } from "@/core/billing";
import { useBillingLineColumns } from "@/hooks/Billing/useBillingLineColumns";
import type { UsageTableProps } from "./type";

export default function UsageTable({ lines, currency, loading = false }: UsageTableProps) {
  const t = useTranslations("billing.usage");
  const columns = useBillingLineColumns(lines, currency);

  return (
    <Table<UsageLine>
      rowKey={billingLineKey}
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
