"use client";

import { Progress } from "antd";
import { CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons";
import { useLocale, useTranslations } from "next-intl";
import { MAX_BROWSER_UPLOAD_BYTES } from "@/core/storageApp";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { formatStorageSize } from "@/utils/number";
import Card from "@/components/Card";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import type { UploadPanelProps } from "./type";

/**
 * The browser's uploads, each with its progress and, when it failed, why. An upload the
 * browser refused to send at all is most likely the Team's own CORS rules having replaced
 * Nodera's: the panel offers to put the rule back and send again.
 */
export default function UploadPanel({
  uploads,
  hasBlocked,
  restoring,
  onRestoreAccess,
  onRetryFailed,
  onClear,
}: UploadPanelProps) {
  const t = useTranslations("storage.files.uploads");
  const locale = useLocale();
  const { getErrorMessage } = useErrorMessage();

  if (uploads.length === 0) return null;

  const active = uploads.filter((u) => u.status === "waiting" || u.status === "uploading");
  const failed = uploads.filter((u) => u.status === "failed");
  const retryable = failed.filter((u) => u.failure !== "tooLarge");

  const failureText = (upload: (typeof uploads)[number]): string => {
    switch (upload.failure) {
      case "blocked":
        return t("failures.blocked");
      case "tooLarge":
        return t("failures.tooLarge", {
          max: formatStorageSize(MAX_BROWSER_UPLOAD_BYTES, locale),
        });
      default:
        return upload.error ? getErrorMessage(upload.error) : t("failures.refused");
    }
  };

  return (
    <Card
      title={active.length > 0 ? t("titleActive", { count: active.length }) : t("title")}
      extra={
        active.length === 0 ? (
          <NoderaButton variant="text" size="small" onClick={onClear}>
            {t("clear")}
          </NoderaButton>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-4">
        {hasBlocked && (
          <NoderaAlert
            variant="warning"
            message={t("blockedTitle")}
            description={
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span>{t("blocked")}</span>
                <NoderaButton
                  variant="filled"
                  size="small"
                  loading={restoring}
                  onClick={onRestoreAccess}
                  className="shrink-0"
                >
                  {t("restoreAccess")}
                </NoderaButton>
              </div>
            }
          />
        )}
        <ul className="flex flex-col gap-3">
          {uploads.map((upload) => (
            <li key={upload.id} className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  {upload.status === "done" && (
                    <CheckCircleFilled className="shrink-0 text-success" aria-hidden />
                  )}
                  {upload.status === "failed" && (
                    <CloseCircleFilled className="shrink-0 text-danger" aria-hidden />
                  )}
                  <span className="truncate font-mono text-text">{upload.key}</span>
                </span>
                <span className="shrink-0 text-xs text-text-muted">
                  {formatStorageSize(upload.size, locale)}
                </span>
              </div>
              {upload.status === "failed" ? (
                <span className="text-xs text-danger">{failureText(upload)}</span>
              ) : (
                <Progress
                  percent={upload.percent}
                  size="small"
                  status={upload.status === "done" ? "success" : "active"}
                  showInfo={upload.status !== "done"}
                />
              )}
            </li>
          ))}
        </ul>
        {retryable.length > 0 && !hasBlocked && (
          <div className="flex justify-end">
            <NoderaButton variant="outlined" size="small" onClick={onRetryFailed}>
              {t("retryFailed", { count: retryable.length })}
            </NoderaButton>
          </div>
        )}
      </div>
    </Card>
  );
}
