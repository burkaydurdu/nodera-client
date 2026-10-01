"use client";

import { useEffect, useState } from "react";
import { Modal } from "antd";
import { useTranslations } from "next-intl";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import NoderaTextField from "@/components/NoderaTextField";
import type { DeleteDropletDialogProps } from "./type";

/** Deletion only proceeds once the hostname is typed back exactly. */
export default function DeleteDropletDialog({
  open,
  hostname,
  loading,
  onClose,
  onConfirm,
}: DeleteDropletDialogProps) {
  const t = useTranslations("droplets.detail.deleteDialog");
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (open) setTyped("");
  }, [open]);

  // Hostnames are lowercase by rule; a phone keyboard's auto-capital must not block the user.
  const matches = typed.trim().toLowerCase() === hostname.toLowerCase();

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
          label={t("inputLabel", { hostname })}
          value={typed}
          onChange={setTyped}
          placeholder={hostname}
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
