"use client";

import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useLocale, useTranslations } from "next-intl";
import type { Cluster, ClusterStatus, NodePool } from "@/core/kubernetesApp";
import { formatDateTime } from "@/utils/date";
import ClusterStatusBadge from "@/components/Kubernetes/ClusterStatusBadge";
import type { ClusterTableProps } from "./type";

export default function ClusterTable({ clusters, onOpen }: ClusterTableProps) {
  const t = useTranslations("kubernetes.list");
  const locale = useLocale();

  const columns: ColumnsType<Cluster> = [
    {
      title: t("columns.name"),
      dataIndex: "name",
      key: "name",
      ellipsis: true,
      render: (name: string) => (
        <span className="truncate font-mono text-sm font-medium text-brand-600">{name}</span>
      ),
    },
    {
      title: t("columns.status"),
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status: ClusterStatus) => <ClusterStatusBadge status={status} />,
    },
    {
      title: t("columns.version"),
      dataIndex: "version",
      key: "version",
      width: 110,
      render: (version: string) => <span className="font-mono text-sm">v{version}</span>,
    },
    {
      title: t("columns.region"),
      dataIndex: "region",
      key: "region",
      width: 110,
      render: (region: string) => <span className="font-mono text-sm">{region}</span>,
    },
    {
      title: t("columns.nodes"),
      dataIndex: "nodePools",
      key: "nodes",
      width: 170,
      render: (pools: NodePool[]) => (
        <span className="text-sm text-text">
          {t("nodesSummary", {
            nodes: pools.reduce((sum, pool) => sum + pool.count, 0),
            pools: pools.length,
          })}
        </span>
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
    <Table<Cluster>
      rowKey="id"
      columns={columns}
      dataSource={clusters}
      pagination={false}
      size="middle"
      scroll={{ x: 860 }}
      rowClassName={() => "cursor-pointer"}
      onRow={(cluster) => ({ onClick: () => onOpen(cluster) })}
    />
  );
}
