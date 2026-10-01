"use client";

import { useState } from "react";
import { App, Switch, Tag } from "antd";
import { SafetyCertificateOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import { UpdateMfa } from "@/api/users";
import type { MfaMethod } from "@/core/user";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import Card from "@/components/Card";
import MfaConfirmModal from "@/components/Profile/MfaConfirmModal";
import type { MfaSettingsCardProps } from "./type";

export default function MfaSettingsCard({ user, onUpdated }: MfaSettingsCardProps) {
  const t = useTranslations("profile.mfa");
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessage();

  const enabled = user.mfaMethod === "email";
  const [targetMethod, setTargetMethod] = useState<MfaMethod | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openConfirm = (checked: boolean) => {
    setError(null);
    setTargetMethod(checked ? "email" : "none");
  };

  const closeConfirm = () => {
    if (loading) return;
    setTargetMethod(null);
  };

  const handleConfirm = async (password: string) => {
    if (!targetMethod) return;
    setLoading(true);
    setError(null);
    try {
      const response = await UpdateMfa({ method: targetMethod, password });
      onUpdated(response.data);
      message.success(t("updated"));
      setTargetMethod(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={t("title")} description={t("description")}>
      <div className="flex items-center justify-between gap-4 rounded-input border border-border bg-surface-raised px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-button bg-brand-50 text-brand-600">
            <SafetyCertificateOutlined style={{ fontSize: 18 }} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-text">{t("methodEmail")}</span>
            <span className="text-xs text-text-muted">
              {enabled ? t("statusOn") : t("statusOff")}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Tag color={enabled ? "green" : "default"}>{enabled ? t("on") : t("off")}</Tag>
          <Switch checked={enabled} onChange={openConfirm} aria-label={t("title")} />
        </div>
      </div>

      <MfaConfirmModal
        open={targetMethod !== null}
        targetMethod={targetMethod ?? "email"}
        loading={loading}
        error={error}
        onClose={closeConfirm}
        onConfirm={handleConfirm}
      />
    </Card>
  );
}
