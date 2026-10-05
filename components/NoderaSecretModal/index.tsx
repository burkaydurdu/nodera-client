"use client";

import { Modal } from "antd";
import { useTranslations } from "next-intl";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import NoderaCopyButton from "@/components/NoderaCopyButton";
import type { NoderaSecretModalProps } from "./type";

/**
 * A secret the service answers only once (an API key, a Webhook's signing secret). The modal
 * closes only on purpose: a stray click outside must not lose what cannot be shown again.
 */
export default function NoderaSecretModal({
  open,
  title,
  description,
  secret,
  warning,
  onClose,
  afterClose,
  children,
}: NoderaSecretModalProps) {
  const t = useTranslations("common");

  return (
    <Modal
      open={open}
      onCancel={onClose}
      afterClose={afterClose}
      title={title}
      footer={null}
      centered
      destroyOnHidden
      maskClosable={false}
      keyboard={false}
      width={children ? 720 : 560}
    >
      <div className="flex flex-col gap-field pt-2">
        {description && <p className="text-sm leading-5 text-text-muted">{description}</p>}
        <div className="flex items-center gap-2 rounded-input border border-border bg-surface-raised px-3 py-2.5">
          <code className="min-w-0 flex-1 break-all font-mono text-sm text-text">
            {secret}
          </code>
          <NoderaCopyButton value={secret} />
        </div>
        <NoderaAlert variant="warning" message={warning} />
        {children}
        <div className="flex justify-end pt-2">
          <NoderaButton variant="filled" onClick={onClose}>
            {t("secretCopied")}
          </NoderaButton>
        </div>
      </div>
    </Modal>
  );
}
