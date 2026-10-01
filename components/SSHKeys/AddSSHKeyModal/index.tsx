"use client";

import { Modal } from "antd";
import { useTranslations } from "next-intl";
import AddSSHKeyForm from "@/components/SSHKeys/AddSSHKeyForm";
import type { AddSSHKeyModalProps } from "./type";

export default function AddSSHKeyModal({
  open,
  teamId,
  onClose,
  onCreated,
}: AddSSHKeyModalProps) {
  const t = useTranslations("sshKeys.form");

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
        <AddSSHKeyForm teamId={teamId} onCreated={onCreated} onCancel={onClose} autoFocus />
      </div>
    </Modal>
  );
}
