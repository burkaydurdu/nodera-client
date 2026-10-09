"use client";

import { useState } from "react";
import { App } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { useLocale, useTranslations } from "next-intl";
import { GetKubeconfig } from "@/api/kubernetes";
import { KUBECONFIG_DAYS, hasControlPlane, kubeconfigFileName } from "@/core/kubernetesApp";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { formatDateTime } from "@/utils/date";
import Card from "@/components/Card";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import NoderaCopyButton from "@/components/NoderaCopyButton";
import type { KubeconfigCardProps } from "./type";

/**
 * Where a member reaches the Cluster from: the Endpoint, and a Kubeconfig cut for them on
 * download, good for seven days. Nodera keeps nothing of it, so each download is a new one.
 */
export default function KubeconfigCard({ projectId, cluster, canWrite }: KubeconfigCardProps) {
  const t = useTranslations("kubernetes.kubeconfig");
  const locale = useLocale();
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessage();
  const [loading, setLoading] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  const ready = hasControlPlane(cluster);

  const download = async () => {
    setLoading(true);
    try {
      const response = await GetKubeconfig(projectId, cluster.id);
      const blob = new Blob([response.data.kubeconfig], { type: "application/yaml" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = kubeconfigFileName(cluster);
      link.click();
      URL.revokeObjectURL(url);
      setExpiresAt(response.data.expiresAt);
      message.success(t("downloaded"));
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={t("title")} description={t("description", { days: KUBECONFIG_DAYS })}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
            {t("endpoint")}
          </span>
          <span className="flex min-w-0 items-center gap-1">
            <span className="truncate font-mono text-sm text-text" title={cluster.endpoint}>
              https://{cluster.endpoint}
            </span>
            <NoderaCopyButton value={`https://${cluster.endpoint}`} />
          </span>
        </div>
        {!ready && <NoderaAlert variant="info" message={t("notReady")} />}
        {canWrite ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text-muted">
              {expiresAt
                ? t("expires", { date: formatDateTime(expiresAt, locale) })
                : t("holderHint")}
            </p>
            <NoderaButton
              variant="filled"
              icon={<DownloadOutlined />}
              onClick={download}
              loading={loading}
              disabled={!ready}
              className="shrink-0"
            >
              {t("download")}
            </NoderaButton>
          </div>
        ) : (
          <p className="text-sm text-text-muted">{t("readOnly")}</p>
        )}
      </div>
    </Card>
  );
}
