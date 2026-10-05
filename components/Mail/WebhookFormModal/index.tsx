"use client";

import { Modal } from "antd";
import { useTranslations } from "next-intl";
import WebhookForm from "@/components/Mail/WebhookForm";
import type { WebhookFormModalProps } from "./type";

export default function WebhookFormModal({
  open,
  projectId,
  webhook,
  onClose,
  onCreated,
  onUpdated,
}: WebhookFormModalProps) {
  const t = useTranslations("mail.webhooks.form");

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={webhook ? t("editTitle") : t("createTitle")}
      footer={null}
      centered
      destroyOnHidden
      width={640}
    >
      <div className="pt-2">
        <WebhookForm
          key={webhook?.id ?? "new"}
          projectId={projectId}
          webhook={webhook}
          onCreated={onCreated}
          onUpdated={onUpdated}
          onCancel={onClose}
          autoFocus
        />
      </div>
    </Modal>
  );
}
