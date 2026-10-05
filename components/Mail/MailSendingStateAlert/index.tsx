"use client";

import { useLocale, useTranslations } from "next-intl";
import type { SendingState } from "@/core/mail";
import { formatDateTime, formatUtcDate } from "@/utils/date";
import NoderaAlert from "@/components/NoderaAlert";
import type { NoderaAlertVariant } from "@/components/NoderaAlert/type";
import type { MailSendingStateAlertProps } from "./type";

const stateVariants: Record<Exclude<SendingState, "paused">, NoderaAlertVariant> = {
  active: "success",
  no_package: "info",
  exhausted: "error",
  daily_limit: "warning",
  suspended: "error",
};

/** Whether the Project can send right now and, when it cannot, why and until when. */
export default function MailSendingStateAlert({ overview }: MailSendingStateAlertProps) {
  const t = useTranslations("mail.sendingState");
  const locale = useLocale();
  const state = overview.sendingState;

  if (state === "paused" || !(state in stateVariants)) return null;

  const values = {
    renews: formatUtcDate(overview.period?.end, locale),
    resets: formatDateTime(overview.dailyLimit.resetsAt, locale),
  };

  return (
    <NoderaAlert
      variant={stateVariants[state]}
      message={t(`${state}.title`)}
      description={t(`${state}.description`, values)}
    />
  );
}
