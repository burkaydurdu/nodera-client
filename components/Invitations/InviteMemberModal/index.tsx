"use client";

import { Modal } from "antd";
import { useTranslations } from "next-intl";
import InviteMemberForm from "@/components/Invitations/InviteMemberForm";
import type { InviteMemberModalProps } from "./type";

export default function InviteMemberModal({
  open,
  teamId,
  onClose,
  onCreated,
}: InviteMemberModalProps) {
  const t = useTranslations("invitations.form");

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={t("modalTitle")}
      footer={null}
      centered
      destroyOnHidden
    >
      <div className="flex flex-col gap-field pt-2">
        <p className="text-sm leading-5 text-text-muted">{t("description")}</p>
        <InviteMemberForm teamId={teamId} onCreated={onCreated} onCancel={onClose} autoFocus />
      </div>
    </Modal>
  );
}
