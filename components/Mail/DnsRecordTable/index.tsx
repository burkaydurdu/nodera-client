"use client";

import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { CheckCircleFilled, ClockCircleOutlined, CloseCircleFilled } from "@ant-design/icons";
import { useLocale, useTranslations } from "next-intl";
import type { DnsRecord, DnsRecordPurpose } from "@/core/mail";
import { formatDateTime } from "@/utils/date";
import NoderaCopyButton from "@/components/NoderaCopyButton";
import type { DnsRecordTableProps } from "./type";

const purposeKeys: Record<DnsRecordPurpose, string> = {
  return_path: "returnPath",
  dkim: "dkim",
};

/** The three CNAMEs the Team adds, each with its own last check so the wrong one stands out. */
export default function DnsRecordTable({ records }: DnsRecordTableProps) {
  const t = useTranslations("mail.domains.records");
  const locale = useLocale();

  const state = (record: DnsRecord) => {
    if (!record.checkedAt) {
      return (
        <span className="flex items-center gap-1.5 text-sm text-text-muted">
          <ClockCircleOutlined />
          {t("notChecked")}
        </span>
      );
    }
    return record.valid ? (
      <span className="flex items-center gap-1.5 text-sm font-medium text-success">
        <CheckCircleFilled />
        {t("valid")}
      </span>
    ) : (
      <span className="flex items-center gap-1.5 text-sm font-medium text-danger">
        <CloseCircleFilled />
        {t("invalid")}
      </span>
    );
  };

  const columns: ColumnsType<DnsRecord> = [
    {
      title: t("columns.purpose"),
      dataIndex: "purpose",
      key: "purpose",
      width: 130,
      render: (purpose: DnsRecordPurpose) => (
        <span className="text-sm font-medium text-text">
          {t(`purpose.${purposeKeys[purpose] ?? "dkim"}`)}
        </span>
      ),
    },
    {
      title: t("columns.type"),
      dataIndex: "type",
      key: "type",
      width: 80,
      render: (type: string) => <span className="font-mono text-sm">{type}</span>,
    },
    {
      title: t("columns.host"),
      dataIndex: "host",
      key: "host",
      render: (host: string) => (
        <span className="flex min-w-0 items-center gap-1">
          <span className="break-all font-mono text-xs text-text">{host}</span>
          <NoderaCopyButton value={host} label={t("copyHost")} />
        </span>
      ),
    },
    {
      title: t("columns.value"),
      dataIndex: "value",
      key: "value",
      render: (value: string) => (
        <span className="flex min-w-0 items-center gap-1">
          <span className="break-all font-mono text-xs text-text">{value}</span>
          <NoderaCopyButton value={value} label={t("copyValue")} />
        </span>
      ),
    },
    {
      title: t("columns.state"),
      key: "state",
      width: 190,
      render: (_: unknown, record) => (
        <span className="flex flex-col gap-0.5">
          {state(record)}
          {record.checkedAt && (
            <span className="text-xs text-text-muted">
              {t("checkedAt", { date: formatDateTime(record.checkedAt, locale) })}
            </span>
          )}
        </span>
      ),
    },
  ];

  return (
    <Table<DnsRecord>
      rowKey={(record) => `${record.purpose}:${record.host}`}
      columns={columns}
      dataSource={records}
      pagination={false}
      size="middle"
      scroll={{ x: 900 }}
    />
  );
}
