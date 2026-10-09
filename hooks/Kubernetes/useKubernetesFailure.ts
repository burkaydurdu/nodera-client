"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { isKubernetesFailureCode } from "@/core/kubernetesApp";

/**
 * Why a Cluster or a Node failed, worded from its failure code through
 * `kubernetes.failureCodes`. A code this build does not know yet reads as the Control plane
 * failing, the service's own catch-all for a Cluster.
 */
export const useKubernetesFailure = () => {
  const t = useTranslations("kubernetes.failureCodes");

  const describe = useCallback(
    (code: string | null | undefined): string =>
      t(isKubernetesFailureCode(code) ? code : "control_plane_failed"),
    [t]
  );

  return { describeKubernetesFailure: describe };
};
