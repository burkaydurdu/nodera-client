"use client";

import { useEffect, useState } from "react";
import { Modal } from "antd";
import { useTranslations } from "next-intl";
import { normalizeKubernetesName } from "@/core/kubernetesApp";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import NoderaTextField from "@/components/NoderaTextField";
import type { DeleteClusterDialogProps } from "./type";

/** Deletion only proceeds once the Cluster's name is typed back exactly. */
export default function DeleteClusterDialog({
  open,
  name,
  loading,
  onClose,
  onConfirm,
}: DeleteClusterDialogProps) {
  const t = useTranslations("kubernetes.settings.deleteDialog");
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (open) setTyped("");
  }, [open]);

  const matches = normalizeKubernetesName(typed) === name;

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
          label={t("inputLabel", { name })}
          value={typed}
          onChange={setTyped}
          placeholder={name}
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          autoFocus
          disabled={loading}
          className="font-mono"
          onEnter={() => matches && onConfirm()}
          error={typed && !matches ? t("mismatch") : null}
        />
        <div className="flex justify-end gap-3 pt-2">
          <NoderaButton variant="outlined" onClick={onClose} disabled={loading}>
            {t("cancel")}
          </NoderaButton>
          <NoderaButton
            variant="danger"
            onClick={onConfirm}
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
