"use client";

import { Modal } from "antd";
import { useTranslations } from "next-intl";
import CreateApiKeyForm from "@/components/ApiKeys/CreateApiKeyForm";
import type { CreateApiKeyModalProps } from "./type";

export default function CreateApiKeyModal({
  open,
  teamId,
  projectId,
  onClose,
  onCreated,
}: CreateApiKeyModalProps) {
  const t = useTranslations("apiKeys.form");

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={t("modalTitle")}
      footer={null}
      centered
      destroyOnHidden
      width={560}
    >
      <div className="pt-2">
        <CreateApiKeyForm
          teamId={teamId}
          projectId={projectId}
          onCreated={onCreated}
          onCancel={onClose}
          autoFocus
        />
      </div>
    </Modal>
  );
}
