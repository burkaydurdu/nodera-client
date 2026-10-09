"use client";

import { useCallback, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { isRole } from "@/core/authz";
import {
  type Notification,
  type NotificationText,
  type NotificationWording,
  notificationKind,
} from "@/core/notification";
import { useDropletFailure } from "@/hooks/Droplet/useDropletFailure";
import { useKubernetesFailure } from "@/hooks/Kubernetes/useKubernetesFailure";
import {
  formatDate,
  formatDateTime,
  formatMonth,
  formatPeriodEnd,
  formatUtcDate,
} from "@/utils/date";
import { formatCount, formatPercentString, formatStorageSize } from "@/utils/number";
import { formatMoney } from "@/utils/price";

/** Resolves a Notification's text in the user's language; an unknown type gets the generic one. */
export const useNotificationText = () => {
  const t = useTranslations("notifications.types");
  const tRoles = useTranslations("teams.roles");
  const tInvoices = useTranslations("billing.invoices");
  const locale = useLocale();
  const { describeDropletFailure } = useDropletFailure();
  const { describeKubernetesFailure } = useKubernetesFailure();

  const wording = useMemo<NotificationWording>(
    () => ({
      t: (key, values) => t(key, values),
      role: (role) => (isRole(role) ? tRoles(role) : role),
      dropletFailure: describeDropletFailure,
      kubernetesFailure: describeKubernetesFailure,
      date: (value) => formatDate(value, locale),
      dateTime: (value) => formatDateTime(value, locale),
      // The same days the invoice shows: a Period is UTC months with an exclusive end.
      period: (start, end) =>
        tInvoices("period", {
          start: formatUtcDate(start, locale),
          end: formatPeriodEnd(end, locale),
        }),
      money: formatMoney,
      count: (value) => formatCount(value, locale),
      percent: (value) => formatPercentString(value, locale),
      month: (period) => formatMonth(period, locale),
      size: (bytes) => formatStorageSize(Number(bytes), locale),
    }),
    [t, tRoles, tInvoices, locale, describeDropletFailure, describeKubernetesFailure]
  );

  return useCallback(
    (notification: Notification): NotificationText =>
      notificationKind(notification).text(notification, wording),
    [wording]
  );
};
