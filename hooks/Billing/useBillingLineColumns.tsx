"use client";

import type { ReactNode } from "react";
import type { ColumnType, ColumnsType } from "antd/es/table";
import { useTranslations } from "next-intl";
import { type BillingLine, type DropletBillingLine, isMailLine } from "@/core/billing";
import { formatMoney } from "@/utils/price";

/** A column only Droplet lines fill: a Mail line's label spans it instead. */
const dropletColumn = (
  column: Omit<ColumnType<BillingLine>, "onCell" | "render">,
  render: (line: DropletBillingLine) => ReactNode
): ColumnType<BillingLine> => ({
  ...column,
  onCell: (line) => ({ colSpan: isMailLine(line) ? 0 : 1 }),
  render: (_: unknown, line) => (isMailLine(line) ? null : render(line)),
});

/**
 * The columns a Period's lines are listed in, on the usage panel and on an invoice alike: a
 * Droplet's hours at its locked price, or a Project's Mail Package on one spanning label.
 */
export const useBillingLineColumns = (
  lines: readonly BillingLine[],
  currency: string
): ColumnsType<BillingLine> => {
  const t = useTranslations("billing.lines");

  const dropletColumns = [
    dropletColumn({ title: t("columns.plan"), key: "plan", width: 140 }, (line) => (
      <span className="font-mono text-sm">{line.planCode}</span>
    )),
    dropletColumn(
      { title: t("columns.hours"), key: "hours", width: 90, align: "right" },
      (line) => t("hoursValue", { hours: line.hours })
    ),
    dropletColumn(
      { title: t("columns.hourlyPrice"), key: "hourlyPrice", width: 140, align: "right" },
      (line) => (
        <span className="font-mono text-sm">{formatMoney(line.hourlyPrice, currency)}</span>
      )
    ),
  ];

  return [
    {
      title: lines.some(isMailLine) ? t("columns.item") : t("columns.droplet"),
      key: "item",
      ellipsis: true,
      onCell: (line) => ({ colSpan: isMailLine(line) ? 1 + dropletColumns.length : 1 }),
      render: (_: unknown, line) =>
        isMailLine(line) ? (
          <span className="text-sm font-medium text-text">
            {t("mail", { project: line.projectName, package: line.packageCode })}
          </span>
        ) : (
          <span className="font-mono text-sm font-medium text-text">{line.hostname}</span>
        ),
    },
    ...dropletColumns,
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
};
