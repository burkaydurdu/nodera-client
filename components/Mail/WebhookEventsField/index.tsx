"use client";

import { useTranslations } from "next-intl";
import { MESSAGE_EVENT_TYPES, type MessageEventType } from "@/core/mail";
import NoderaButton from "@/components/NoderaButton";
import NoderaCheckbox from "@/components/NoderaCheckbox";
import NoderaFormField from "@/components/NoderaFormField";
import type { WebhookEventsFieldProps } from "./type";

/** The six Message events, each with what it means, to pick the ones a Webhook receives. */
export default function WebhookEventsField({
  value,
  onChange,
  error,
  disabled = false,
}: WebhookEventsFieldProps) {
  const t = useTranslations("mail.webhooks.form");
  const te = useTranslations("mail.events");
  const ted = useTranslations("mail.eventDescriptions");
  const all = value.length === MESSAGE_EVENT_TYPES.length;

  const toggle = (type: MessageEventType, checked: boolean) => {
    const next = checked
      ? [...value.filter((item) => item !== type), type]
      : value.filter((item) => item !== type);
    // Kept in the catalog's order, so the request and the list read the same way.
    onChange(MESSAGE_EVENT_TYPES.filter((item) => next.includes(item)));
  };

  return (
    <NoderaFormField label={t("events")} error={error} required>
      <div className="flex flex-col gap-2">
        <div className="flex justify-end">
          <NoderaButton
            variant="text"
            size="small"
            disabled={disabled}
            onClick={() => onChange(all ? [] : [...MESSAGE_EVENT_TYPES])}
          >
            {all ? t("selectNone") : t("selectAll")}
          </NoderaButton>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {MESSAGE_EVENT_TYPES.map((type) => (
            <NoderaCheckbox
              key={type}
              checked={value.includes(type)}
              disabled={disabled}
              onChange={(event) => toggle(type, event.target.checked)}
            >
              <span className="flex flex-col">
                <span className="text-sm font-medium text-text">{te(type)}</span>
                <span className="text-xs text-text-muted">{ted(type)}</span>
              </span>
            </NoderaCheckbox>
          ))}
        </div>
      </div>
    </NoderaFormField>
  );
}
