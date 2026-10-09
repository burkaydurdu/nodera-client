"use client";

import { useEffect, useState } from "react";
import { Modal } from "antd";
import { useTranslations } from "next-intl";
import { normalizeBucketName } from "@/core/storageApp";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import NoderaTextField from "@/components/NoderaTextField";
import type { DeleteStorageDialogProps } from "./type";

/** Deletion only proceeds once the Bucket name is typed back exactly. */
export default function DeleteStorageDialog({
  open,
  bucketName,
  loading,
  onClose,
  onConfirm,
}: DeleteStorageDialogProps) {
  const t = useTranslations("storage.settings.deleteDialog");
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (open) setTyped("");
  }, [open]);

  // Bucket names are lower-case by rule; a phone keyboard's auto-capital must not block the user.
  const normalized = normalizeBucketName(typed);
  const matches = normalized === bucketName;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={t("title")}
      footer={null}
      centered
      destroyOnHidden
    >
      <div className="flex flex-col gap-field pt-2">
        <NoderaAlert variant="error" message={t("warningTitle")} description={t("warning")} />
        <NoderaTextField
          label={t("inputLabel", { name: bucketName })}
          value={typed}
          onChange={setTyped}
          placeholder={bucketName}
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          autoFocus
          disabled={loading}
          className="font-mono"
          onEnter={() => matches && onConfirm(normalized)}
          error={typed && !matches ? t("mismatch") : null}
        />
        <div className="flex justify-end gap-3 pt-2">
          <NoderaButton variant="outlined" onClick={onClose} disabled={loading}>
            {t("cancel")}
          </NoderaButton>
          <NoderaButton
            variant="danger"
            onClick={() => onConfirm(normalized)}
            loading={loading}
            disabled={!matches}
          >
            {t("confirm")}
          </NoderaButton>
        </div>
      </div>
    </Modal>
  );
}
