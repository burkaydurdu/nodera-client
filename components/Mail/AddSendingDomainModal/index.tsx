"use client";

import { Modal } from "antd";
import { useTranslations } from "next-intl";
import AddSendingDomainForm from "@/components/Mail/AddSendingDomainForm";
import type { AddSendingDomainModalProps } from "./type";

export default function AddSendingDomainModal({
  open,
  projectId,
  existingNames,
  onClose,
  onCreated,
}: AddSendingDomainModalProps) {
  const t = useTranslations("mail.domains.form");

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={t("modalTitle")}
      footer={null}
      centered
      destroyOnHidden
      width={520}
    >
      <div className="flex flex-col gap-4 pt-2">
        <p className="text-sm leading-5 text-text-muted">{t("description")}</p>
        <AddSendingDomainForm
          projectId={projectId}
          existingNames={existingNames}
          onCreated={onCreated}
          onCancel={onClose}
          autoFocus
        />
      </div>
    </Modal>
  );
}
