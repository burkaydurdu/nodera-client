"use client";

import { Table, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { useLocale, useTranslations } from "next-intl";
import { type SendingDomain, type SendingDomainStatus, isDmarcMissing } from "@/core/mail";
import { formatDateTime } from "@/utils/date";
import SendingDomainStatusBadge from "@/components/Mail/SendingDomainStatusBadge";
import type { SendingDomainTableProps } from "./type";

export default function SendingDomainTable({ domains, onOpen }: SendingDomainTableProps) {
  const t = useTranslations("mail.domains");
  const locale = useLocale();

  const columns: ColumnsType<SendingDomain> = [
    {
      title: t("columns.domain"),
      dataIndex: "name",
      key: "name",
      ellipsis: true,
      render: (name: string, domain) => (
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate font-mono text-sm font-medium text-brand-600">{name}</span>
          {isDmarcMissing(domain) && (
            <Tooltip title={t("dmarcMissingShort")}>
              <ExclamationCircleOutlined
                className="shrink-0 text-warning"
                aria-label={t("dmarcMissingShort")}
              />
            </Tooltip>
          )}
        </span>
      ),
    },
    {
      title: t("columns.status"),
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status: SendingDomainStatus) => <SendingDomainStatusBadge status={status} />,
    },
    {
      title: t("columns.lastChecked"),
      dataIndex: "lastCheckedAt",
      key: "lastChecked",
      width: 190,
      render: (value: string | null) =>
        value ? (
          formatDateTime(value, locale)
        ) : (
          <span className="text-text-muted">{t("notCheckedYet")}</span>
        ),
    },
    {
      title: t("columns.added"),
      dataIndex: "createdAt",
      key: "added",
      width: 190,
      render: (value: string) => formatDateTime(value, locale),
    },
  ];

  return (
    <Table<SendingDomain>
      rowKey="id"
      columns={columns}
      dataSource={domains}
      pagination={false}
      size="middle"
      scroll={{ x: 720 }}
      rowClassName={() => "cursor-pointer"}
      onRow={(domain) => ({ onClick: () => onOpen(domain) })}
    />
  );
}
