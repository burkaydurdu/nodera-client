"use client";

import { useEffect, useState } from "react";
import { App } from "antd";
import { useTranslations } from "next-intl";
import { RenameCluster } from "@/api/kubernetes";
import { ErrorCode } from "@/core/error";
import {
  CLUSTER_NAME_MAX_LENGTH,
  normalizeKubernetesName,
  validateKubernetesName,
} from "@/core/kubernetesApp";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { IsErrorCode } from "@/utils/error";
import Card from "@/components/Card";
import KubernetesNameField from "@/components/Kubernetes/KubernetesNameField";
import NoderaButton from "@/components/NoderaButton";
import type { RenameClusterCardProps } from "./type";

/** The name is the customer's; the Endpoint carries the id, so nothing else moves. */
export default function RenameClusterCard({
  projectId,
  cluster,
  disabled,
  onRenamed,
}: RenameClusterCardProps) {
  const t = useTranslations("kubernetes.settings.rename");
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessage();
  const [name, setName] = useState(cluster.name);
  const [serverError, setServerError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(cluster.name);
  }, [cluster.name]);
  useEffect(() => {
    setServerError(null);
  }, [name]);

  const normalized = normalizeKubernetesName(name);
  const changed = normalized !== cluster.name;

  const submit = async () => {
    setTouched(true);
    if (!changed || validateKubernetesName(normalized, CLUSTER_NAME_MAX_LENGTH)) return;
    setLoading(true);
    try {
      const response = await RenameCluster(projectId, cluster.id, { name: normalized });
      onRenamed(response.data);
      message.success(t("done", { name: response.data.name }));
    } catch (err) {
      if (
        IsErrorCode(err, ErrorCode.ClusterNameTaken) ||
        IsErrorCode(err, ErrorCode.ClusterInvalidName)
      ) {
        setServerError(getErrorMessage(err));
      } else {
        message.error(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={t("title")} description={t("description")}>
      <div className="flex flex-col gap-field">
        <KubernetesNameField
          label={t("label")}
          placeholder={cluster.name}
          value={name}
          onChange={setName}
          maxLength={CLUSTER_NAME_MAX_LENGTH}
          serverError={serverError}
          touched={touched}
          disabled={disabled || loading}
          onEnter={submit}
        />
        <div className="flex justify-end">
          <NoderaButton
            variant="filled"
            onClick={submit}
            loading={loading}
            disabled={disabled || !changed}
          >
            {t("button")}
          </NoderaButton>
        </div>
      </div>
    </Card>
  );
}
