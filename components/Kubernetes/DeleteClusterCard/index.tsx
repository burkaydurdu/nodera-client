"use client";

import { DeleteOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import Card from "@/components/Card";
import NoderaButton from "@/components/NoderaButton";
import type { DeleteClusterCardProps } from "./type";

/** The way out: every Node released and its Droplet deleted, then the Control plane. */
export default function DeleteClusterCard({
  cluster,
  deleting,
  onDelete,
}: DeleteClusterCardProps) {
  const t = useTranslations("kubernetes.settings.delete");

  return (
    <Card title={t("title")} description={t("description")}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-text-muted">{t("frees", { name: cluster.name })}</p>
        <NoderaButton
          variant="danger"
          icon={<DeleteOutlined />}
          loading={deleting}
          onClick={onDelete}
          className="shrink-0"
        >
          {t("button")}
        </NoderaButton>
      </div>
    </Card>
  );
}
