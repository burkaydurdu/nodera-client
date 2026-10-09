"use client";

import { useTranslations } from "next-intl";
import type { Cluster } from "@/core/kubernetesApp";
import { useKubernetesFailure } from "@/hooks/Kubernetes/useKubernetesFailure";
import NoderaAlert from "@/components/NoderaAlert";
import type { ClusterStatusAlertProps } from "./type";

/** The one banner over a Cluster: why it is not simply running, when it is not. */
export default function ClusterStatusAlert({ cluster }: ClusterStatusAlertProps) {
  const t = useTranslations("kubernetes.statusAlert");
  const { describeKubernetesFailure } = useKubernetesFailure();

  const alert = alertFor(cluster);
  if (!alert) return null;

  if (alert === "failed") {
    return (
      <NoderaAlert
        variant="error"
        message={t("failed.title")}
        description={
          // The service's sentence is English; it stands in only where no code was kept.
          cluster.failureCode
            ? describeKubernetesFailure(cluster.failureCode)
            : cluster.failureReason || t("failed.noReason")
        }
      />
    );
  }

  return (
    <NoderaAlert
      variant={alert === "provisioning" ? "info" : "warning"}
      message={t(`${alert}.title`)}
      description={t(`${alert}.description`)}
    />
  );
}

type Alert = "provisioning" | "deleting" | "suspended" | "degraded" | "failed";

function alertFor(cluster: Cluster): Alert | null {
  if (cluster.status === "deleting") return "deleting";
  if (cluster.status === "failed") return "failed";
  if (cluster.billingStatus === "suspended") return "suspended";
  if (cluster.status === "degraded") return "degraded";
  if (cluster.status === "provisioning") return "provisioning";
  return null;
}
