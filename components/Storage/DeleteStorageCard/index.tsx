"use client";

import { DeleteOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import Card from "@/components/Card";
import NoderaButton from "@/components/NoderaButton";
import type { DeleteStorageCardProps } from "./type";

/** The way out: the Storage and everything in it, its keys revoked and its Package ended. */
export default function DeleteStorageCard({
  storage,
  deleting,
  onDelete,
}: DeleteStorageCardProps) {
  const t = useTranslations("storage.settings.delete");

  return (
    <Card title={t("title")} description={t("description")}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-text-muted">{t("frees", { name: storage.bucketName })}</p>
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
