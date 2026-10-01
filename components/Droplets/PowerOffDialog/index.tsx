"use client";

import { Modal } from "antd";
import { useTranslations } from "next-intl";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import type { PowerOffDialogProps } from "./type";

/** Confirms a power-off and reminds that a powered-off Droplet is still rented and billed. */
export default function PowerOffDialog({
  open,
  hostname,
  loading,
  onClose,
  onConfirm,
}: PowerOffDialogProps) {
  const t = useTranslations("droplets.detail.powerOffDialog");

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
        <p className="text-sm leading-5 text-text-muted">{t("description", { hostname })}</p>
        <NoderaAlert
          variant="warning"
          message={t("billingTitle")}
          description={t("billing")}
        />
        <div className="flex justify-end gap-3 pt-2">
          <NoderaButton variant="outlined" onClick={onClose} disabled={loading}>
            {t("cancel")}
          </NoderaButton>
          <NoderaButton variant="filled" onClick={onConfirm} loading={loading}>
            {t("confirm")}
          </NoderaButton>
        </div>
      </div>
    </Modal>
  );
}
