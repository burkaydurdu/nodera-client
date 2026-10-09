"use client";

import { useRef } from "react";
import { DeleteOutlined, ReloadOutlined, UploadOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import NoderaButton from "@/components/NoderaButton";
import type { FileToolbarProps } from "./type";

/** The actions over the browser: upload into this folder, delete what is ticked, read again. */
export default function FileToolbar({
  canWrite,
  selectedCount,
  deleting,
  onUpload,
  onDeleteSelected,
  onRefresh,
}: FileToolbarProps) {
  const t = useTranslations("storage.files");
  const input = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {canWrite && selectedCount > 0 && (
        <NoderaButton
          variant="danger"
          size="small"
          icon={<DeleteOutlined />}
          loading={deleting}
          onClick={onDeleteSelected}
        >
          {t("deleteSelected", { count: selectedCount })}
        </NoderaButton>
      )}
      <NoderaButton
        variant="outlined"
        size="small"
        icon={<ReloadOutlined />}
        onClick={onRefresh}
        aria-label={t("refresh")}
      >
        {t("refresh")}
      </NoderaButton>
      {canWrite && (
        <>
          <input
            ref={input}
            type="file"
            multiple
            className="hidden"
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              if (files.length > 0) onUpload(files);
              // The same file picked twice in a row must fire again.
              event.target.value = "";
            }}
          />
          <NoderaButton
            variant="filled"
            size="small"
            icon={<UploadOutlined />}
            onClick={() => input.current?.click()}
          >
            {t("upload")}
          </NoderaButton>
        </>
      )}
    </div>
  );
}
