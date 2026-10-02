"use client";

import { Segmented } from "antd";
import { useTranslations } from "next-intl";
import { BILLING_TABS, type BillingTabKey } from "@/core/billing";
import type { BillingTabsProps } from "./type";

/** Static map: the URL value is kebab-case, the locale key camelCase. */
const LABEL_KEYS: Record<BillingTabKey, string> = {
  profile: "profile",
  "payment-methods": "paymentMethods",
  invoices: "invoices",
  usage: "usage",
};

/** The sub-tabs of the Billing area, below the Team tabs. */
export default function BillingTabs({ active, onChange }: BillingTabsProps) {
  const t = useTranslations("billing.tabs");

  return (
    <Segmented<BillingTabKey>
      value={active}
      onChange={onChange}
      options={BILLING_TABS.map((key) => ({ value: key, label: t(LABEL_KEYS[key]) }))}
      className="self-start"
    />
  );
}
