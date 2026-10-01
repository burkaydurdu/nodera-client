"use client";

import { Modal } from "antd";
import { CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import NoderaButton from "@/components/NoderaButton";
import type { NoderaResultModalProps } from "./type";

export default function NoderaResultModal({
  open,
  onClose,
  variant,
  title,
  message,
  actionLabel,
  onAction,
}: NoderaResultModalProps) {
  const t = useTranslations("common");
  const Icon = variant === "success" ? CheckCircleFilled : CloseCircleFilled;

  return (
    <Modal open={open} onCancel={onClose} centered footer={null} width={440} destroyOnHidden>
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <Icon
          className={variant === "success" ? "text-success" : "text-danger"}
          style={{ fontSize: 48 }}
        />
        <h2 className="text-lg font-semibold leading-6 text-text">{title}</h2>
        <p className="text-sm leading-5 text-text-muted">{message}</p>
        <NoderaButton
          variant="filled"
          onClick={onAction ?? onClose}
          className="mt-2 min-w-[160px]"
        >
          {actionLabel ?? t("close")}
        </NoderaButton>
      </div>
    </Modal>
  );
}
