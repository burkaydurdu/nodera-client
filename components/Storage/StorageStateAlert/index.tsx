"use client";

import { useLocale, useTranslations } from "next-intl";
import { isStoragePauseReason, storagePath } from "@/core/storageApp";
import { useNavigate } from "@/hooks/Navigation/useNavigate";
import { formatDateTime } from "@/utils/date";
import { formatStorageSize } from "@/utils/number";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import type { StorageStateAlertProps } from "./type";

/**
 * Why the Storage is not fully usable right now: being deleted, stopped over an unpaid
 * invoice, Paused by Nodera (with the reason), or full. Nothing while it is active.
 */
export default function StorageStateAlert({ storage, canWrite }: StorageStateAlertProps) {
  const t = useTranslations("storage.stateAlert");
  const locale = useLocale();
  const { navigate } = useNavigate();

  switch (storage.state) {
    case "deleting":
      return (
        <NoderaAlert
          variant="warning"
          message={t("deleting.title")}
          description={t("deleting.description")}
        />
      );
    case "suspended":
      return (
        <NoderaAlert
          variant="error"
          message={t("suspended.title")}
          description={t("suspended.description")}
        />
      );
    case "paused": {
      const reason = storage.pause?.reason;
      return (
        <NoderaAlert
          variant="error"
          message={
            storage.pause
              ? t("paused.title", { date: formatDateTime(storage.pause.pausedAt, locale) })
              : t("paused.titleNoDate")
          }
          description={
            <span className="flex flex-col gap-1">
              <span>
                {isStoragePauseReason(reason)
                  ? t(`paused.reasons.${reason}`)
                  : t("paused.reasons.unknown")}
              </span>
              <span>{t("paused.lift")}</span>
            </span>
          }
        />
      );
    }
    case "full":
      return (
        <NoderaAlert
          variant="error"
          message={t("full.title")}
          description={
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>
                {t("full.description", {
                  size: formatStorageSize(storage.package.sizeBytes, locale),
                  package: storage.package.code,
                })}
              </span>
              {canWrite && (
                <NoderaButton
                  variant="danger"
                  size="small"
                  className="shrink-0"
                  onClick={() =>
                    navigate(storagePath(storage.projectId, storage.id, "settings"))
                  }
                >
                  {t("full.changePackage")}
                </NoderaButton>
              )}
            </div>
          }
        />
      );
    default:
      return null;
  }
}
