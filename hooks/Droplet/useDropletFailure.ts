"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { isDropletFailureCode } from "@/core/droplet";

/**
 * Why a Droplet failed, worded from its failure code through `droplets.failureCodes`. A code this
 * build does not know yet reads as `unavailable`, the service's own catch-all.
 */
export const useDropletFailure = () => {
  const t = useTranslations("droplets.failureCodes");

  const describe = useCallback(
    (code: string | null | undefined): string =>
      t(isDropletFailureCode(code) ? code : "unavailable"),
    [t]
  );

  return { describeDropletFailure: describe };
};
