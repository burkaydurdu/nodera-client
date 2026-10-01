"use client";

import { useEffect, useState } from "react";
import { Modal } from "antd";
import { useTranslations } from "next-intl";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import NoderaTextField from "@/components/NoderaTextField";
import type { MfaConfirmModalProps } from "./type";

/** Asks for the current password before an MFA method change. */
export default function MfaConfirmModal({
  open,
  targetMethod,
  loading,
  error,
  onClose,
  onConfirm,
}: MfaConfirmModalProps) {
  const t = useTranslations("profile.mfa");
  const tv = useTranslations("validation");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setPassword("");
      setPasswordError(null);
    }
  }, [open]);

  const handleConfirm = () => {
    if (!password) {
      setPasswordError(tv("passwordRequired"));
      return;
    }
    setPasswordError(null);
    onConfirm(password);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={t("confirmTitle")}
      footer={null}
      centered
      destroyOnHidden
    >
      <div className="flex flex-col gap-field pt-2">
        <p className="text-sm leading-5 text-text-muted">
          {targetMethod === "email"
            ? t("confirmDescriptionEnable")
            : t("confirmDescriptionDisable")}
        </p>
        {error && <NoderaAlert variant="error" message={error} />}
        <NoderaTextField
          label={t("password")}
          kind="password"
          value={password}
          onChange={setPassword}
          error={passwordError}
          autoComplete="current-password"
          autoFocus
          onEnter={handleConfirm}
          disabled={loading}
        />
        <div className="flex justify-end gap-3 pt-2">
          <NoderaButton variant="outlined" onClick={onClose} disabled={loading}>
            {t("cancel")}
          </NoderaButton>
          <NoderaButton
            variant={targetMethod === "none" ? "danger" : "filled"}
            onClick={handleConfirm}
            loading={loading}
          >
            {targetMethod === "email" ? t("enable") : t("disable")}
          </NoderaButton>
        </div>
      </div>
    </Modal>
  );
}
