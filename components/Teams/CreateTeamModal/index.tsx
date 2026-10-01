"use client";

import { Modal } from "antd";
import { useTranslations } from "next-intl";
import CreateTeamForm from "@/components/Teams/CreateTeamForm";
import type { CreateTeamModalProps } from "./type";

export default function CreateTeamModal({ open, onClose, onCreated }: CreateTeamModalProps) {
  const t = useTranslations("teams.create");

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
        <p className="text-sm leading-5 text-text-muted">{t("description")}</p>
        <CreateTeamForm onCreated={onCreated} onCancel={onClose} autoFocus />
      </div>
    </Modal>
  );
}
