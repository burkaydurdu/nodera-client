"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";

/**
 * A Payment's `failure_reason` is a customer-safe category code (`card_declined`, …); it is
 * shown through `billing.failureReasons.<code>`, with a generic text for a code this build
 * does not know yet.
 */
export const useFailureReason = () => {
  const t = useTranslations("billing.failureReasons");

  const describe = useCallback(
    (reason: string | null | undefined): string => {
      if (reason && t.has(reason)) return t(reason);
      return t("unknown");
    },
    [t]
  );

  return { describeFailureReason: describe };
};
