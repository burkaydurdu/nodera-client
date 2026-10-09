"use client";

import { useEffect, useState } from "react";
import { InputNumber, Tag, Tooltip } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import { MAX_NODES_PER_POOL, MIN_NODES_PER_POOL, countingNodes } from "@/core/kubernetesApp";
import Card from "@/components/Card";
import NodeTable from "@/components/Kubernetes/NodeTable";
import NoderaButton from "@/components/NoderaButton";
import type { NodePoolCardProps } from "./type";

/**
 * One Node pool: its Plan, how many Nodes it asks for against how many stand, the count to
 * change, and its Nodes. The service counts only standing Nodes, so the count is weighed against
 * them: choosing the same count again replaces the ones that failed. More Nodes are opened as
 * Droplets; fewer releases the newest.
 */
export default function NodePoolCard({
  pool,
  nodes,
  canWrite,
  frozen,
  last,
  busy,
  onResize,
  onDelete,
}: NodePoolCardProps) {
  const t = useTranslations("kubernetes.poolCard");
  const [count, setCount] = useState(pool.count);
  const [resizing, setResizing] = useState(false);

  useEffect(() => {
    setCount(pool.count);
  }, [pool.count]);

  const poolNodes = nodes.filter((node) => node.poolId === pool.id);
  const standing = countingNodes(nodes, pool.id).length;
  const ready = poolNodes.filter((node) => node.status === "ready").length;
  const changed = count !== standing;
  const replacing = count === pool.count && standing < pool.count;

  const applyResize = async () => {
    if (!changed || resizing) return;
    setResizing(true);
    try {
      if (!(await onResize(pool, count))) setCount(pool.count);
    } finally {
      setResizing(false);
    }
  };

  const labels = Object.entries(pool.labels);

  return (
    <Card
      title={pool.name}
      description={t("description", { plan: pool.planCode, ready, count: pool.count })}
      extra={
        canWrite && !frozen ? (
          <div className="flex items-center gap-2">
            <InputNumber
              min={MIN_NODES_PER_POOL}
              max={MAX_NODES_PER_POOL}
              value={count}
              onChange={(value) => setCount(Number(value ?? MIN_NODES_PER_POOL))}
              disabled={busy || resizing}
              size="middle"
              className="w-20"
              aria-label={t("count")}
            />
            {changed && (
              <NoderaButton
                variant={count > standing ? "filled" : "outlined"}
                size="small"
                onClick={applyResize}
                loading={resizing}
                disabled={busy}
              >
                {replacing
                  ? t("replaceNodes")
                  : count > standing
                    ? t("addNodes")
                    : t("removeNodes")}
              </NoderaButton>
            )}
            <Tooltip title={last ? t("lastPool") : undefined}>
              <span>
                <NoderaButton
                  variant="danger"
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => onDelete(pool)}
                  disabled={last || busy || resizing}
                  aria-label={t("deletePool")}
                />
              </span>
            </Tooltip>
          </div>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-3">
        {(labels.length > 0 || pool.taints.length > 0) && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {labels.map(([key, value]) => (
              <Tag key={key} className="m-0 font-mono">
                {value ? `${key}=${value}` : key}
              </Tag>
            ))}
            {pool.taints.map((taint) => (
              <Tag
                key={`${taint.key}:${taint.effect}`}
                color="orange"
                className="m-0 font-mono"
              >
                {taint.value ? `${taint.key}=${taint.value}` : taint.key}:{taint.effect}
              </Tag>
            ))}
          </div>
        )}
        {standing < pool.count && (
          <p className="text-xs text-text-muted">
            {t("standing", { standing, count: pool.count })}
          </p>
        )}
        <NodeTable nodes={poolNodes} />
      </div>
    </Card>
  );
}
