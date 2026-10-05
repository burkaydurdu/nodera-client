"use client";

import { SearchOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import {
  MAIL_LOG_RETENTION_DAYS,
  MESSAGE_EVENT_TYPES,
  type RecipientStatus,
} from "@/core/mail";
import Card from "@/components/Card";
import NoderaButton from "@/components/NoderaButton";
import NoderaDateRangePicker from "@/components/NoderaDateRangePicker";
import type { NoderaDateRangePickerProps } from "@/components/NoderaDateRangePicker/type";
import NoderaSelect from "@/components/NoderaSelect";
import NoderaTextField from "@/components/NoderaTextField";
import type { MessageFilterValue, MessageFiltersProps } from "./type";

/** Logs reach back this many days: no earlier day can hold a Message, nor can a later one. */
const isOutsideRetention: NonNullable<NoderaDateRangePickerProps["disabledDate"]> = (
  current
) => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const earliest = new Date();
  earliest.setHours(0, 0, 0, 0);
  earliest.setDate(earliest.getDate() - MAIL_LOG_RETENTION_DAYS);
  const day = current.valueOf();
  return day < earliest.getTime() || day > today.getTime();
};

export default function MessageFilters({
  value,
  onChange,
  onSearch,
  onReset,
  loading = false,
}: MessageFiltersProps) {
  const t = useTranslations("mail.logs.filters");
  const te = useTranslations("mail.events");

  const set = <K extends keyof MessageFilterValue>(key: K, next: MessageFilterValue[K]) =>
    onChange({ ...value, [key]: next });

  const statusOptions = [
    { value: "" as const, label: t("anyStatus") },
    ...MESSAGE_EVENT_TYPES.map((type) => ({ value: type, label: te(type) })),
  ];

  return (
    <Card>
      <div className="grid grid-cols-1 gap-field sm:grid-cols-2 lg:grid-cols-3">
        <NoderaSelect<RecipientStatus | "">
          label={t("status")}
          value={value.status}
          onChange={(status) => set("status", status)}
          options={statusOptions}
          searchable={false}
        />
        <NoderaTextField
          label={t("recipient")}
          value={value.recipient}
          onChange={(recipient) => set("recipient", recipient)}
          placeholder={t("recipientPlaceholder")}
          onEnter={onSearch}
        />
        <NoderaTextField
          label={t("from")}
          value={value.from}
          onChange={(from) => set("from", from)}
          placeholder={t("fromPlaceholder")}
          onEnter={onSearch}
        />
        <NoderaTextField
          label={t("tag")}
          value={value.tag}
          onChange={(tag) => set("tag", tag)}
          placeholder={t("tagPlaceholder")}
          onEnter={onSearch}
        />
        <NoderaDateRangePicker
          label={t("dates")}
          hint={t("datesHint", { days: MAIL_LOG_RETENTION_DAYS })}
          value={value.range}
          onChange={(range) => set("range", range)}
          disabledDate={isOutsideRetention}
          openEnded
        />
        <div className="flex items-start gap-3 sm:pt-[26px]">
          <NoderaButton
            variant="filled"
            icon={<SearchOutlined />}
            onClick={onSearch}
            loading={loading}
          >
            {t("search")}
          </NoderaButton>
          <NoderaButton variant="text" onClick={onReset} disabled={loading}>
            {t("reset")}
          </NoderaButton>
        </div>
      </div>
    </Card>
  );
}
