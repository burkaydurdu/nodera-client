"use client";

import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import classNames from "classnames";
import { useTranslations } from "next-intl";
import type { Plan } from "@/core/catalog";
import { formatUsd } from "@/utils/price";
import ImageChips from "@/components/Catalog/ImageChips";
import type { PlanTableProps } from "./type";

export default function PlanTable({
  plans,
  images,
  loading = false,
  onSelect,
  selectedCode = null,
}: PlanTableProps) {
  const t = useTranslations("catalog");
  const selectable = !!onSelect;
  const selectedPlan = plans.find((plan) => plan.code === selectedCode) ?? null;

  const columns: ColumnsType<Plan> = [
    {
      title: t("columns.plan"),
      dataIndex: "code",
      key: "plan",
      width: 160,
      render: (code: string, plan) => (
        <div className="flex flex-col gap-1">
          <span className="font-mono text-sm font-medium text-text">{code}</span>
          {plan.soldOut && (
            <Tag color="default" className="m-0 w-fit rounded-badge">
              {t("soldOut")}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: t("columns.cpu"),
      key: "cpu",
      render: (_: unknown, plan) => (
        <span className="text-sm text-text">
          {t("cpuValue", { count: plan.cpuCount, description: plan.cpuDescription })}
        </span>
      ),
    },
    {
      title: t("columns.ram"),
      dataIndex: "ramGb",
      key: "ram",
      width: 110,
      render: (gb: number) => t("ramValue", { gb }),
    },
    { title: t("columns.disk"), dataIndex: "diskDescription", key: "disk" },
    { title: t("columns.bandwidth"), dataIndex: "bandwidthDescription", key: "bandwidth" },
    {
      title: t("columns.images"),
      dataIndex: "images",
      key: "images",
      width: 220,
      render: (codes: string[]) => <ImageChips codes={codes} images={images} />,
    },
    {
      title: t("columns.price"),
      key: "price",
      align: "right",
      width: 170,
      render: (_: unknown, plan) => (
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-sm font-semibold text-text">
            {t("perHour", { price: formatUsd(plan.hourlyPrice) })}
          </span>
          <span className="text-xs text-text-muted">
            {t("perMonth", { price: formatUsd(plan.monthlyPrice) })}
          </span>
        </div>
      ),
    },
  ];

  return (
    <Table<Plan>
      rowKey="id"
      columns={columns}
      dataSource={plans}
      loading={loading}
      pagination={false}
      size="middle"
      locale={{ emptyText: t("noPlans") }}
      scroll={{ x: 960 }}
      // The radio column is what a keyboard user reaches; the row click stays for the mouse.
      rowSelection={
        selectable
          ? {
              type: "radio",
              columnWidth: 48,
              selectedRowKeys: selectedPlan ? [selectedPlan.id] : [],
              onChange: (_keys, rows) => {
                if (rows[0] && !rows[0].soldOut) onSelect(rows[0]);
              },
              getCheckboxProps: (plan) => ({
                disabled: plan.soldOut,
                "aria-label": t("selectPlan", { plan: plan.code }),
              }),
            }
          : undefined
      }
      rowClassName={(plan) =>
        classNames(
          selectable && !plan.soldOut && "cursor-pointer",
          plan.soldOut && "opacity-60",
          selectable && plan.code === selectedCode && "bg-brand-50"
        )
      }
      onRow={(plan) =>
        selectable && !plan.soldOut
          ? {
              onClick: () => onSelect(plan),
              "aria-selected": plan.code === selectedCode,
            }
          : { "aria-disabled": plan.soldOut || undefined }
      }
    />
  );
}
