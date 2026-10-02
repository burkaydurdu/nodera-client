"use client";

import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useLocale, useTranslations } from "next-intl";
import type { InvoiceLine } from "@/core/billing";
import { formatUtcDate } from "@/utils/date";
import { formatMoney, formatRateBps } from "@/utils/price";
import type { InvoiceBreakdownProps } from "./type";

/** One line per Droplet, the tax lines and the totals as the invoice states them. */
export default function InvoiceBreakdown({ invoice }: InvoiceBreakdownProps) {
  const t = useTranslations("billing.invoices.detail");
  const locale = useLocale();
  const { currency } = invoice;

  const columns: ColumnsType<InvoiceLine> = [
    {
      title: t("columns.droplet"),
      dataIndex: "hostname",
      key: "hostname",
      ellipsis: true,
      render: (hostname: string) => <span className="font-mono text-sm">{hostname}</span>,
    },
    {
      title: t("columns.plan"),
      dataIndex: "planCode",
      key: "plan",
      width: 140,
      render: (code: string) => <span className="font-mono text-sm">{code}</span>,
    },
    {
      title: t("columns.hours"),
      dataIndex: "hours",
      key: "hours",
      width: 90,
      align: "right",
      render: (hours: number) => t("hoursValue", { hours }),
    },
    {
      title: t("columns.hourlyPrice"),
      dataIndex: "hourlyPrice",
      key: "hourlyPrice",
      width: 140,
      align: "right",
      render: (price: string) => (
        <span className="font-mono text-sm">{formatMoney(price, currency)}</span>
      ),
    },
    {
      title: t("columns.amount"),
      dataIndex: "amount",
      key: "amount",
      width: 140,
      align: "right",
      render: (amount: string) => (
        <span className="font-mono text-sm font-medium text-text">
          {formatMoney(amount, currency)}
        </span>
      ),
    },
  ];

  const totals: Array<{ label: string; value: string; strong?: boolean; muted?: boolean }> = [
    { label: t("subtotal"), value: formatMoney(invoice.subtotal, currency) },
    ...invoice.taxLines.map((line) => ({
      label: `${line.label} (${formatRateBps(line.rateBps)})`,
      value: formatMoney(line.amount, currency),
    })),
    ...(invoice.creditApplied && Number.parseFloat(invoice.creditApplied) > 0
      ? [{ label: t("credit"), value: `− ${formatMoney(invoice.creditApplied, currency)}` }]
      : []),
    { label: t("total"), value: formatMoney(invoice.totalDue, currency), strong: true },
    ...(invoice.settlementAmount
      ? [
          {
            label: t("settlement", { currency: invoice.settlementCurrency ?? "" }),
            value: formatMoney(invoice.settlementAmount, invoice.settlementCurrency),
            muted: true,
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col gap-4">
      <Table<InvoiceLine>
        rowKey="dropletId"
        columns={columns}
        dataSource={invoice.lines}
        pagination={false}
        size="small"
        locale={{ emptyText: t("noLines") }}
        scroll={{ x: 640 }}
      />
      <dl className="ml-auto flex w-full max-w-sm flex-col gap-1.5 border-t border-border pt-3">
        {totals.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-4 text-sm">
            <dt className={row.strong ? "font-semibold text-text" : "text-text-muted"}>
              {row.label}
            </dt>
            <dd
              className={
                row.strong
                  ? "font-mono text-base font-semibold text-text"
                  : row.muted
                    ? "font-mono text-text-muted"
                    : "font-mono text-text"
              }
            >
              {row.value}
            </dd>
          </div>
        ))}
        {invoice.exchangeRate && (
          <p className="pt-1 text-right text-xs text-text-muted">
            {t("exchangeRate", {
              rate: invoice.exchangeRate,
              date: formatUtcDate(invoice.exchangeRateDate, locale),
            })}
          </p>
        )}
      </dl>
    </div>
  );
}
