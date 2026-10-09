"use client";

import { Table, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useLocale, useTranslations } from "next-intl";
import type { ClusterNode, NodeStatus } from "@/core/kubernetesApp";
import { useKubernetesFailure } from "@/hooks/Kubernetes/useKubernetesFailure";
import { formatDateTime } from "@/utils/date";
import NodeStatusBadge from "@/components/Kubernetes/NodeStatusBadge";
import NoderaCopyButton from "@/components/NoderaCopyButton";
import NoderaLink from "@/components/NoderaLink";
import type { NodeTableProps } from "./type";

/** The Nodes of one pool. A Node is a Droplet of the Project; its row links there. */
export default function NodeTable({ nodes }: NodeTableProps) {
  const t = useTranslations("kubernetes.nodes");
  const locale = useLocale();
  const { describeKubernetesFailure } = useKubernetesFailure();

  const columns: ColumnsType<ClusterNode> = [
    {
      title: t("columns.hostname"),
      dataIndex: "hostname",
      key: "hostname",
      ellipsis: true,
      render: (hostname: string, node) =>
        node.dropletId ? (
          <NoderaLink
            href={`/dashboard/droplets/${node.dropletId}`}
            className="font-mono text-sm"
          >
            {hostname}
          </NoderaLink>
        ) : (
          <span className="font-mono text-sm text-text">{hostname}</span>
        ),
    },
    {
      title: t("columns.status"),
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status: NodeStatus, node) => {
        const badge = <NodeStatusBadge status={status} />;
        if (status !== "failed") return badge;
        return (
          <Tooltip
            title={
              node.failureCode
                ? describeKubernetesFailure(node.failureCode)
                : node.failureReason || t("failedNoReason")
            }
          >
            <span>{badge}</span>
          </Tooltip>
        );
      },
    },
    {
      title: t("columns.ipv4"),
      dataIndex: "ipv4",
      key: "ipv4",
      width: 190,
      render: (ipv4: string | null) =>
        ipv4 ? (
          <span className="flex items-center gap-1">
            <span className="font-mono text-sm">{ipv4}</span>
            <NoderaCopyButton value={ipv4} />
          </span>
        ) : (
          <span className="text-sm text-text-muted">{t("pendingIp")}</span>
        ),
    },
    {
      title: t("columns.readyAt"),
      dataIndex: "readyAt",
      key: "readyAt",
      width: 180,
      render: (value: string | null, node) =>
        value ? (
          formatDateTime(value, locale)
        ) : (
          <span className="text-sm text-text-muted">
            {t("since", { date: formatDateTime(node.createdAt, locale) })}
          </span>
        ),
    },
  ];

  return (
    <Table<ClusterNode>
      rowKey="id"
      columns={columns}
      dataSource={nodes}
      pagination={false}
      size="small"
      scroll={{ x: 700 }}
      locale={{ emptyText: t("empty") }}
    />
  );
}
