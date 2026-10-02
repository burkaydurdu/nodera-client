"use client";

import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DownloadOutlined } from "@ant-design/icons";
import { useLocale, useTranslations } from "next-intl";
import type { InvoiceKind, InvoiceStatus, InvoiceSummary } from "@/core/billing";
import { formatDate, formatPeriodEnd, formatUtcDate } from "@/utils/date";
import { formatMoney } from "@/utils/price";
import InvoiceStatusBadge from "@/components/Billing/InvoiceStatusBadge";
import NoderaButton from "@/components/NoderaButton";
import type { InvoiceTableProps } from "./type";

const dash = "—";

export default function InvoiceTable({
  invoices,
  loading = false,
  onOpen,
  onDownload,
  downloadingId = null,
}: InvoiceTableProps) {
  const t = useTranslations("billing.invoices");
  const td = useTranslations("billing.invoices.detail");
  const locale = useLocale();

  const columns: ColumnsType<InvoiceSummary> = [
    {
      title: t("columns.number"),
      dataIndex: "number",
      key: "number",
      width: 170,
      render: (number: string) => (
        <span className="font-mono text-sm font-medium text-brand-600">{number}</span>
      ),
    },
    {
      title: t("columns.period"),
      key: "period",
      width: 220,
      render: (_: unknown, row) =>
        t("period", {
          start: formatUtcDate(row.periodStart, locale),
          end: formatPeriodEnd(row.periodEnd, locale),
        }),
    },
    {
      title: t("columns.kind"),
      dataIndex: "kind",
      key: "kind",
      width: 120,
      render: (kind: InvoiceKind) => t(`kind.${kind}`),
    },
    {
      title: t("columns.status"),
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status: InvoiceStatus) => <InvoiceStatusBadge status={status} />,
    },
    {
      title: t("columns.total"),
      key: "total",
      width: 140,
      align: "right",
      render: (_: unknown, row) => (
        <span className="font-mono text-sm font-medium text-text">
          {formatMoney(row.totalDue, row.currency)}
        </span>
      ),
    },
    {
      title: t("columns.settlement"),
      key: "settlement",
      width: 150,
      align: "right",
      render: (_: unknown, row) =>
        row.settlementAmount ? (
          <span className="font-mono text-sm text-text-muted">
            {formatMoney(row.settlementAmount, row.settlementCurrency)}
          </span>
        ) : (
          <span className="text-text-muted">{dash}</span>
        ),
    },
    {
      title: t("columns.issued"),
      dataIndex: "issuedAt",
      key: "issued",
      width: 130,
      render: (value: string) => formatDate(value, locale),
    },
    {
      title: t("columns.paid"),
      dataIndex: "paidAt",
      key: "paid",
      width: 130,
      render: (value: string | null) =>
        value ? formatDate(value, locale) : <span className="text-text-muted">{dash}</span>,
    },
    {
      title: "",
      key: "pdf",
      width: 80,
      align: "right",
      render: (_: unknown, row) => (
        <NoderaButton
          variant="text"
          size="small"
          icon={<DownloadOutlined />}
          aria-label={td("downloadPdfOf", { number: row.number })}
          title={td("downloadPdf")}
          loading={downloadingId === row.id}
          onClick={(event) => {
            // The row itself opens the detail; the button only downloads.
            event.stopPropagation();
            onDownload(row);
          }}
        />
      ),
    },
  ];

  return (
    <Table<InvoiceSummary>
      rowKey="id"
      columns={columns}
      dataSource={invoices}
      loading={loading}
      pagination={false}
      size="middle"
      locale={{ emptyText: t("empty") }}
      scroll={{ x: 1180 }}
      rowClassName={() => "cursor-pointer"}
      onRow={(invoice) => ({ onClick: () => onOpen(invoice) })}
    />
  );
}
