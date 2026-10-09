"use client";

import { useEffect, useState } from "react";
import { Modal } from "antd";
import { useTranslations } from "next-intl";
import { AddNodePool } from "@/api/kubernetes";
import { ErrorCode } from "@/core/error";
import {
  MAX_NODES_PER_POOL,
  MIN_NODES_PER_POOL,
  POOL_NAME_MAX_LENGTH,
  normalizeKubernetesName,
  validateKubernetesName,
} from "@/core/kubernetesApp";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { IsErrorCode } from "@/utils/error";
import NodePoolFields from "@/components/Kubernetes/NodePoolFields";
import type {
  NodePoolDraft,
  NodePoolFieldErrors,
} from "@/components/Kubernetes/NodePoolFields/type";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import type { AddNodePoolModalProps } from "./type";

const EMPTY: NodePoolDraft = { name: "", plan: undefined, count: 1 };

/** A second or later Node pool; its Nodes are asked for as soon as the Cluster can be joined. */
export default function AddNodePoolModal({
  open,
  projectId,
  cluster,
  plans,
  onClose,
  onAdded,
}: AddNodePoolModalProps) {
  const t = useTranslations("kubernetes.addPool");
  const { getErrorMessage } = useErrorMessage();
  const [pool, setPool] = useState<NodePoolDraft>(EMPTY);
  const [touched, setTouched] = useState(false);
  const [errors, setErrors] = useState<NodePoolFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setPool(EMPTY);
      setTouched(false);
      setErrors({});
      setFormError(null);
    }
  }, [open]);
  useEffect(() => {
    setErrors({});
  }, [pool.name, pool.plan, pool.count]);

  const handleSubmit = async () => {
    if (loading) return;
    setTouched(true);
    setFormError(null);
    const name = normalizeKubernetesName(pool.name);
    const badCount = pool.count < MIN_NODES_PER_POOL || pool.count > MAX_NODES_PER_POOL;
    setErrors({
      plan: pool.plan ? null : t("planRequired"),
      count: badCount
        ? t("countRange", { min: MIN_NODES_PER_POOL, max: MAX_NODES_PER_POOL })
        : null,
    });
    if (validateKubernetesName(name, POOL_NAME_MAX_LENGTH) || !pool.plan || badCount) return;

    setLoading(true);
    try {
      const response = await AddNodePool(projectId, cluster.id, {
        name,
        plan: pool.plan,
        count: pool.count,
      });
      onAdded(response.data);
    } catch (error) {
      if (
        IsErrorCode(error, ErrorCode.ClusterInvalidPoolName) ||
        IsErrorCode(error, ErrorCode.ClusterPoolNameTaken)
      ) {
        setErrors({ name: getErrorMessage(error) });
      } else if (
        IsErrorCode(error, ErrorCode.KubernetesPlanNotFound) ||
        IsErrorCode(error, ErrorCode.KubernetesPlanNotForNodes) ||
        IsErrorCode(error, ErrorCode.KubernetesPlanSoldOut)
      ) {
        setErrors({ plan: getErrorMessage(error) });
      } else if (IsErrorCode(error, ErrorCode.ClusterTooManyNodes)) {
        setErrors({ count: getErrorMessage(error) });
      } else {
        setFormError(getErrorMessage(error));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={t("title")}
      footer={null}
      centered
      destroyOnHidden
    >
      <div className="flex flex-col gap-field pt-2">
        {formError && <NoderaAlert variant="error" message={formError} />}
        <NodePoolFields
          value={pool}
          onChange={setPool}
          plans={plans}
          errors={errors}
          touched={touched}
          disabled={loading}
          onEnter={handleSubmit}
        />
        <div className="flex justify-end gap-3 pt-2">
          <NoderaButton variant="outlined" onClick={onClose} disabled={loading}>
            {t("cancel")}
          </NoderaButton>
          <NoderaButton variant="filled" onClick={handleSubmit} loading={loading}>
            {t("submit")}
          </NoderaButton>
        </div>
      </div>
    </Modal>
  );
}
