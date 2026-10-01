"use client";

import { Modal } from "antd";
import { useTranslations } from "next-intl";
import CreateProjectForm from "@/components/Projects/CreateProjectForm";
import type { CreateProjectModalProps } from "./type";

export default function CreateProjectModal({
  open,
  teamId,
  onClose,
  onCreated,
}: CreateProjectModalProps) {
  const t = useTranslations("dashboard.projectForm");

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={t("modalTitle")}
      footer={null}
      centered
      destroyOnHidden
    >
      <div className="pt-2">
        <CreateProjectForm
          teamId={teamId}
          onCreated={onCreated}
          onCancel={onClose}
          autoFocus
        />
      </div>
    </Modal>
  );
}
