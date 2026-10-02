"use client";

import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { CreditCardOutlined } from "@ant-design/icons";
import { useLocale, useTranslations } from "next-intl";
import type { PaymentMethod } from "@/core/billing";
import { formatDateTime } from "@/utils/date";
import DefaultCardBadge from "@/components/Billing/DefaultCardBadge";
import NoderaButton from "@/components/NoderaButton";
import type { PaymentMethodTableProps } from "./type";

/** Some providers do not report the expiry; 0/0 means unknown, not January of year zero. */
const expiry = (method: PaymentMethod) =>
  method.expMonth && method.expYear
    ? `${String(method.expMonth).padStart(2, "0")} / ${method.expYear}`
    : "—";

export default function PaymentMethodTable({
  methods,
  loading = false,
  busyId = null,
  onSetDefault,
  onDelete,
}: PaymentMethodTableProps) {
  const t = useTranslations("billing.paymentMethods");
  const locale = useLocale();
  const withActions = !!onSetDefault || !!onDelete;

  const columns: ColumnsType<PaymentMethod> = [
    {
      title: t("columns.card"),
      key: "card",
      ellipsis: true,
      render: (_: unknown, row) => (
        <span className="flex items-center gap-2">
          <CreditCardOutlined className="text-text-muted" />
          <span className="text-sm font-medium text-text">
            {t("cardLabel", { brand: row.brand, last4: row.last4 })}
          </span>
          {row.isDefault && <DefaultCardBadge />}
        </span>
      ),
    },
    {
      title: t("columns.expires"),
      key: "expires",
      width: 130,
      render: (_: unknown, row) => <span className="font-mono text-sm">{expiry(row)}</span>,
    },
    {
      title: t("columns.currency"),
      dataIndex: "currency",
      key: "currency",
      width: 110,
    },
    {
      title: t("columns.added"),
      dataIndex: "createdAt",
      key: "added",
      width: 180,
      render: (value: string) => formatDateTime(value, locale),
    },
    ...(withActions
      ? [
          {
            title: "",
            key: "actions",
            width: 220,
            align: "right" as const,
            render: (_: unknown, row: PaymentMethod) => (
              <span className="flex items-center justify-end gap-1">
                {onSetDefault && !row.isDefault && (
                  <NoderaButton
                    variant="text"
                    size="small"
                    onClick={() => onSetDefault(row)}
                    loading={busyId === row.id}
                  >
                    {t("makeDefault")}
                  </NoderaButton>
                )}
                {onDelete && (
                  <NoderaButton
                    variant="text"
                    size="small"
                    onClick={() => onDelete(row)}
                    loading={busyId === row.id}
                    className="text-danger!"
                  >
                    {t("delete")}
                  </NoderaButton>
                )}
              </span>
            ),
          },
        ]
      : []),
  ];

  return (
    <Table<PaymentMethod>
      rowKey="id"
      columns={columns}
      dataSource={methods}
      loading={loading}
      pagination={false}
      size="middle"
      locale={{ emptyText: t("empty") }}
      scroll={{ x: 760 }}
    />
  );
}
