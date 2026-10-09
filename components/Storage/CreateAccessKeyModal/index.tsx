"use client";

import { Modal } from "antd";
import { useTranslations } from "next-intl";
import CreateAccessKeyForm from "@/components/Storage/CreateAccessKeyForm";
import type { CreateAccessKeyModalProps } from "./type";

export default function CreateAccessKeyModal({
  open,
  projectId,
  storageId,
  onClose,
  onCreated,
}: CreateAccessKeyModalProps) {
  const t = useTranslations("storage.accessKeys.form");

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
        <CreateAccessKeyForm
          projectId={projectId}
          storageId={storageId}
          onCreated={onCreated}
          onCancel={onClose}
          autoFocus
        />
      </div>
    </Modal>
  );
}
