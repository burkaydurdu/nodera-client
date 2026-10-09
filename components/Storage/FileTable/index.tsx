"use client";

import { Table, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  DownloadOutlined,
  FileOutlined,
  FolderOutlined,
  GlobalOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { useLocale, useTranslations } from "next-intl";
import { baseName, objectUrl } from "@/core/storageApp";
import { formatDateTime } from "@/utils/date";
import { formatStorageSize } from "@/utils/number";
import NoderaButton from "@/components/NoderaButton";
import NoderaCopyButton from "@/components/NoderaCopyButton";
import type { FileRow, FileTableProps } from "./type";

/** Folders first, then objects; a folder opens on click, an object downloads from its button. */
export default function FileTable({
  bucketUrl,
  folders,
  objects,
  selectedKeys,
  onSelectionChange,
  selectable,
  downloadable,
  downloadingKey,
  onOpenFolder,
  onDownload,
  access,
  onHoverObject,
  publishable,
  togglingKey,
  onToggleAccess,
}: FileTableProps) {
  const t = useTranslations("storage.files");
  const locale = useLocale();

  const rows: FileRow[] = [
    ...folders.map((key): FileRow => ({ kind: "folder", key })),
    ...objects.map((object): FileRow => ({ kind: "object", key: object.key, object })),
  ];

  // What the switch says once the object's access was read; until then nothing.
  const accessLabel = (key: string) => {
    const known = access[key];
    if (known === undefined) return t("access.reading");
    return known ? t("access.publicHint") : t("access.privateHint");
  };

  const columns: ColumnsType<FileRow> = [
    {
      title: t("columns.name"),
      key: "name",
      ellipsis: true,
      render: (_value, row) =>
        row.kind === "folder" ? (
          <button
            type="button"
            onClick={() => onOpenFolder(row.key)}
            className="flex min-w-0 max-w-full items-center gap-2 text-left font-mono text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            <FolderOutlined className="shrink-0" aria-hidden />
            <span className="truncate">{baseName(row.key)}/</span>
          </button>
        ) : (
          <Tooltip
            title={
              <span className="flex flex-col gap-1 text-xs">
                <span className="flex items-center gap-1 font-mono">
                  <span className="break-all">{objectUrl(bucketUrl, row.key)}</span>
                  <NoderaCopyButton
                    value={objectUrl(bucketUrl, row.key)}
                    label={t("copyUrl")}
                  />
                </span>
                <span>{accessLabel(row.key)}</span>
              </span>
            }
            placement="topLeft"
            styles={{ root: { maxWidth: 560 } }}
          >
            <span
              className="group flex min-w-0 items-center gap-2 font-mono text-sm text-text"
              onMouseEnter={() => onHoverObject(row.object)}
            >
              <FileOutlined className="shrink-0 text-text-muted" aria-hidden />
              <span className="truncate">{baseName(row.key)}</span>
              <NoderaCopyButton
                value={objectUrl(bucketUrl, row.key)}
                label={t("copyUrl")}
                className="opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
              />
            </span>
          </Tooltip>
        ),
    },
    {
      title: t("columns.size"),
      key: "size",
      width: 120,
      align: "right",
      render: (_value, row) =>
        row.kind === "object" ? (
          <span className="font-mono text-sm">
            {formatStorageSize(row.object.size, locale)}
          </span>
        ) : (
          <span className="text-text-muted">—</span>
        ),
    },
    {
      title: t("columns.modified"),
      key: "modified",
      width: 190,
      render: (_value, row) =>
        row.kind === "object" ? (
          formatDateTime(row.object.modifiedAt, locale)
        ) : (
          <span className="text-text-muted">—</span>
        ),
    },
    ...(downloadable
      ? [
          {
            key: "actions",
            width: 260,
            align: "right" as const,
            render: (_value: unknown, row: FileRow) =>
              row.kind === "object" ? (
                <span className="flex items-center justify-end gap-1">
                  <Tooltip title={publishable ? t("access.switchHint") : accessLabel(row.key)}>
                    <NoderaButton
                      variant="text"
                      size="small"
                      icon={access[row.key] ? <GlobalOutlined /> : <LockOutlined />}
                      loading={togglingKey === row.key}
                      disabled={!publishable}
                      onClick={() =>
                        access[row.key] === undefined
                          ? onHoverObject(row.object)
                          : onToggleAccess(row.object, !access[row.key])
                      }
                    >
                      {access[row.key] === undefined
                        ? t("access.reading")
                        : access[row.key]
                          ? t("access.public")
                          : t("access.private")}
                    </NoderaButton>
                  </Tooltip>
                  <NoderaButton
                    variant="text"
                    size="small"
                    icon={<DownloadOutlined />}
                    loading={downloadingKey === row.key}
                    onClick={() => onDownload(row.object)}
                  >
                    {t("download")}
                  </NoderaButton>
                </span>
              ) : null,
          },
        ]
      : []),
  ];

  return (
    <Table<FileRow>
      rowKey="key"
      columns={columns}
      dataSource={rows}
      pagination={false}
      size="middle"
      scroll={{ x: 640 }}
      onRow={(row) => ({
        onMouseEnter: () => {
          if (row.kind === "object") onHoverObject(row.object);
        },
      })}
      rowSelection={
        selectable
          ? {
              selectedRowKeys: selectedKeys,
              onChange: (keys) => onSelectionChange(keys.map(String)),
              getCheckboxProps: (row) => ({ disabled: row.kind === "folder" }),
            }
          : undefined
      }
    />
  );
}
