"use client";

import { useCallback, useEffect, useState } from "react";
import { App } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import {
  DeletePaymentMethod,
  ListPaymentMethods,
  SetDefaultPaymentMethod,
  StartCardVerification,
} from "@/api/billing";
import { type PaymentMethod, notifyBillingStatusChanged } from "@/core/billing";
import { ErrorCode } from "@/core/error";
import { setPendingCardVerification } from "@/core/storage";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { IsErrorCode } from "@/utils/error";
import PaymentMethodTable from "@/components/Billing/PaymentMethodTable";
import Card from "@/components/Card";
import EmptyBox from "@/components/EmptyBox";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import type { PaymentMethodsPanelProps } from "./type";

/** The Payment methods tab: saved cards, the hosted add-card flow, default and delete. */
export default function PaymentMethodsPanel({
  teamId,
  canWrite,
  onOpenProfile,
}: PaymentMethodsPanelProps) {
  const t = useTranslations("billing.paymentMethods");
  const { message, modal } = App.useApp();
  const { getErrorMessage } = useErrorMessage();

  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [profileRequired, setProfileRequired] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ListPaymentMethods(teamId);
      setMethods(response.data ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [teamId, getErrorMessage]);

  useEffect(() => {
    load();
  }, [load]);

  // Back from the hosted card form through the browser's back button, the page comes from
  // the back-forward cache with "Add card" still spinning; it must be usable again.
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) setStarting(false);
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  // The hosted form is a full-page redirect: the Team is stashed so the return page completes
  // the verification for the right Team even if the selection changed meanwhile.
  const addCard = async () => {
    if (starting) return;
    setStarting(true);
    setProfileRequired(false);
    try {
      const response = await StartCardVerification(teamId);
      setPendingCardVerification({ verificationId: response.data.verificationId, teamId });
      window.location.assign(response.data.redirectUrl);
    } catch (err) {
      if (IsErrorCode(err, ErrorCode.PaymentMethodProfileRequired)) setProfileRequired(true);
      else message.error(getErrorMessage(err));
      setStarting(false);
    }
  };

  const setDefault = async (method: PaymentMethod) => {
    setBusyId(method.id);
    try {
      const response = await SetDefaultPaymentMethod(teamId, method.id);
      setMethods((list) =>
        list.map((item) =>
          item.id === method.id ? response.data : { ...item, isDefault: false }
        )
      );
      message.success(t("madeDefault", { last4: method.last4 }));
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = (method: PaymentMethod) => {
    modal.confirm({
      title: t("deleteTitle", { last4: method.last4 }),
      content: t("deleteConfirm"),
      okText: t("delete"),
      okButtonProps: { danger: true },
      cancelText: t("cancel"),
      centered: true,
      onOk: async () => {
        setBusyId(method.id);
        try {
          await DeletePaymentMethod(teamId, method.id);
          setMethods((list) => list.filter((item) => item.id !== method.id));
          message.success(t("deleted", { last4: method.last4 }));
          notifyBillingStatusChanged();
        } catch (err) {
          message.error(getErrorMessage(err));
        } finally {
          setBusyId(null);
        }
      },
    });
  };

  const addButton = canWrite ? (
    <NoderaButton
      variant="filled"
      size="small"
      icon={<PlusOutlined />}
      onClick={addCard}
      loading={starting}
    >
      {t("add")}
    </NoderaButton>
  ) : undefined;

  const profileRequiredAlert = profileRequired && (
    <NoderaAlert
      variant="warning"
      message={t("profileRequiredTitle")}
      description={
        <div className="flex flex-col items-start gap-3">
          <span>{t("profileRequired")}</span>
          <NoderaButton variant="outlined" size="small" onClick={onOpenProfile}>
            {t("openProfile")}
          </NoderaButton>
        </div>
      }
    />
  );

  return (
    <div className="flex flex-col gap-section">
      {profileRequiredAlert}
      <Card
        title={t("title")}
        description={t("description")}
        flush
        extra={methods.length > 0 ? addButton : undefined}
      >
        {error ? (
          <div className="flex flex-col items-start gap-3 px-6 pb-6">
            <NoderaAlert variant="error" message={error} className="w-full" />
            <NoderaButton variant="outlined" size="small" onClick={load}>
              {t("retry")}
            </NoderaButton>
          </div>
        ) : !loading && methods.length === 0 ? (
          <div className="px-6 pb-8">
            <EmptyBox
              title={t("emptyTitle")}
              description={canWrite ? t("emptyDescription") : t("emptyReadOnly")}
              actionLabel={canWrite ? t("add") : undefined}
              onAction={canWrite ? addCard : undefined}
            />
          </div>
        ) : (
          <PaymentMethodTable
            methods={methods}
            loading={loading}
            busyId={busyId}
            onSetDefault={canWrite ? setDefault : undefined}
            onDelete={canWrite ? confirmDelete : undefined}
          />
        )}
      </Card>
    </div>
  );
}
