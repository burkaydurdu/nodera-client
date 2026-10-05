"use client";

import { useState } from "react";
import { Switch } from "antd";
import { useTranslations } from "next-intl";
import { CreateWebhook, UpdateWebhook } from "@/api/mail";
import { ErrorCode } from "@/core/error";
import {
  MESSAGE_EVENT_TYPES,
  type MessageEventType,
  WEBHOOK_URL_MAX_LENGTH,
} from "@/core/mail";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { GetValidationErrors, IsErrorCode } from "@/utils/error";
import WebhookEventsField from "@/components/Mail/WebhookEventsField";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import NoderaTextField from "@/components/NoderaTextField";
import type { WebhookFormProps } from "./type";

/** Only web addresses are sent to; the service also refuses private ones outside development. */
const isWebUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return (url.protocol === "https:" || url.protocol === "http:") && !!url.hostname;
  } catch {
    return false;
  }
};

export default function WebhookForm({
  projectId,
  webhook,
  onCreated,
  onUpdated,
  onCancel,
  autoFocus = false,
}: WebhookFormProps) {
  const t = useTranslations("mail.webhooks.form");
  const { getErrorMessage, getFieldErrorMessage } = useErrorMessage();

  const [url, setUrl] = useState(webhook?.url ?? "");
  const [events, setEvents] = useState<MessageEventType[]>(
    webhook?.events ?? [...MESSAGE_EVENT_TYPES]
  );
  const [active, setActive] = useState(webhook?.active ?? true);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (loading) return;
    setFormError(null);

    const trimmedUrl = url.trim();
    const urlIssue = !trimmedUrl
      ? t("urlRequired")
      : trimmedUrl.length > WEBHOOK_URL_MAX_LENGTH
        ? t("urlTooLong", { max: WEBHOOK_URL_MAX_LENGTH })
        : !isWebUrl(trimmedUrl)
          ? t("urlInvalid")
          : null;
    const eventsIssue = events.length === 0 ? t("eventsRequired") : null;
    setUrlError(urlIssue);
    setEventsError(eventsIssue);
    if (urlIssue || eventsIssue) return;

    setLoading(true);
    try {
      if (webhook) {
        const response = await UpdateWebhook(projectId, webhook.id, {
          url: trimmedUrl,
          events,
          active,
        });
        onUpdated(response.data);
      } else {
        const response = await CreateWebhook(projectId, { url: trimmedUrl, events });
        onCreated(response.data);
      }
    } catch (error) {
      const fieldErrors = GetValidationErrors(error);
      const urlField = fieldErrors.find((fe) => fe.field === "url");
      const eventsField = fieldErrors.find((fe) => fe.field.startsWith("events"));
      if (urlField) setUrlError(getFieldErrorMessage(urlField));
      if (eventsField) setEventsError(getFieldErrorMessage(eventsField));
      if (fieldErrors.length > 0) return;
      if (IsErrorCode(error, ErrorCode.WebhookInvalidUrl)) {
        setUrlError(getErrorMessage(error));
      } else if (IsErrorCode(error, ErrorCode.WebhookInvalidEvents)) {
        setEventsError(getErrorMessage(error));
      } else {
        setFormError(getErrorMessage(error));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-field">
      {formError && <NoderaAlert variant="error" message={formError} />}
      <NoderaTextField
        label={t("url")}
        value={url}
        onChange={setUrl}
        placeholder={t("urlPlaceholder")}
        hint={t("urlHint")}
        error={urlError}
        maxLength={WEBHOOK_URL_MAX_LENGTH}
        autoFocus={autoFocus}
        onEnter={handleSubmit}
        disabled={loading}
        required
      />
      <WebhookEventsField
        value={events}
        onChange={(next) => {
          setEvents(next);
          setEventsError(null);
        }}
        error={eventsError}
        disabled={loading}
      />
      {webhook && (
        <label className="flex items-center justify-between gap-4 rounded-input border border-border px-4 py-3">
          <span className="flex flex-col">
            <span className="text-sm font-medium text-text">{t("active")}</span>
            <span className="text-xs text-text-muted">{t("activeHint")}</span>
          </span>
          <Switch checked={active} onChange={setActive} disabled={loading} />
        </label>
      )}
      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <NoderaButton variant="outlined" onClick={onCancel} disabled={loading}>
            {t("cancel")}
          </NoderaButton>
        )}
        <NoderaButton variant="filled" onClick={handleSubmit} loading={loading}>
          {webhook ? t("save") : t("submit")}
        </NoderaButton>
      </div>
    </div>
  );
}
