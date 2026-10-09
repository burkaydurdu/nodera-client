"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { OpenCluster } from "@/api/kubernetes";
import { billingPath } from "@/core/billing";
import { ErrorCode } from "@/core/error";
import {
  CLUSTER_NAME_MAX_LENGTH,
  MAX_NODES_PER_POOL,
  MIN_NODES_PER_POOL,
  POOL_NAME_MAX_LENGTH,
  normalizeKubernetesName,
  validateKubernetesName,
} from "@/core/kubernetesApp";
import useTeam from "@/contexts/TeamContext/useTeam";
import { useCan } from "@/hooks/Authz/useCan";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { GetValidationErrors, IsErrorCode } from "@/utils/error";
import KubernetesNameField from "@/components/Kubernetes/KubernetesNameField";
import NodePoolFields from "@/components/Kubernetes/NodePoolFields";
import type {
  NodePoolDraft,
  NodePoolFieldErrors,
} from "@/components/Kubernetes/NodePoolFields/type";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import NoderaLink from "@/components/NoderaLink";
import NoderaSelect from "@/components/NoderaSelect";
import type { OpenClusterFormProps } from "./type";

/**
 * Opens a Cluster in one step: a name, a Region, a Kubernetes version and the first Node pool.
 * The answer is a provisioning Cluster; its Control plane comes up and its Nodes are opened as
 * Droplets afterwards. What the Team's Billing status refuses (no card, suspended) is told with
 * the way to fix it; a taken name goes on the field so another can be picked.
 */
export default function OpenClusterForm({
  projectId,
  regions,
  versions,
  plans,
  onOpened,
  onCancel,
}: OpenClusterFormProps) {
  const t = useTranslations("kubernetes.open");
  const { currentTeam } = useTeam();
  const canPay = useCan("billing.write");
  const { getErrorMessage, getFieldErrorMessage } = useErrorMessage();

  const [name, setName] = useState("");
  const [region, setRegion] = useState<string | undefined>(
    regions.length === 1 ? regions[0].code : undefined
  );
  const [version, setVersion] = useState<string | undefined>(versions[0]?.version);
  const [pool, setPool] = useState<NodePoolDraft>({
    name: "workers",
    plan: undefined,
    count: 2,
  });
  const [touched, setTouched] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [regionError, setRegionError] = useState<string | null>(null);
  const [versionError, setVersionError] = useState<string | null>(null);
  const [poolErrors, setPoolErrors] = useState<NodePoolFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [billingLink, setBillingLink] = useState<"card" | "invoice" | null>(null);
  const [loading, setLoading] = useState(false);

  // A refusal names one name; another has to be judged afresh.
  useEffect(() => {
    setNameError(null);
  }, [name]);
  useEffect(() => {
    setPoolErrors({});
  }, [pool.name, pool.plan, pool.count]);

  const handleSubmit = async () => {
    if (loading) return;
    setTouched(true);
    setFormError(null);
    setBillingLink(null);

    const clusterName = normalizeKubernetesName(name);
    const poolName = normalizeKubernetesName(pool.name);
    const nameIssue = validateKubernetesName(clusterName, CLUSTER_NAME_MAX_LENGTH);
    const poolIssue = validateKubernetesName(poolName, POOL_NAME_MAX_LENGTH);
    const badCount = pool.count < MIN_NODES_PER_POOL || pool.count > MAX_NODES_PER_POOL;
    setRegionError(region ? null : t("regionRequired"));
    setVersionError(version ? null : t("versionRequired"));
    setPoolErrors({
      plan: pool.plan ? null : t("planRequired"),
      count: badCount
        ? t("countRange", { min: MIN_NODES_PER_POOL, max: MAX_NODES_PER_POOL })
        : null,
    });
    if (nameIssue || poolIssue || !region || !version || !pool.plan || badCount) return;

    setLoading(true);
    try {
      const response = await OpenCluster(projectId, {
        name: clusterName,
        region,
        version,
        nodePool: { name: poolName, plan: pool.plan, count: pool.count },
      });
      onOpened(response.data);
    } catch (error) {
      const fieldErrors = GetValidationErrors(error);
      const nameField = fieldErrors.find((fe) => fe.field === "name");
      if (nameField) {
        setNameError(getFieldErrorMessage(nameField));
      } else if (
        IsErrorCode(error, ErrorCode.ClusterInvalidName) ||
        IsErrorCode(error, ErrorCode.ClusterNameTaken)
      ) {
        setNameError(getErrorMessage(error));
      } else if (IsErrorCode(error, ErrorCode.ClusterInvalidPoolName)) {
        setPoolErrors({ name: getErrorMessage(error) });
      } else if (
        IsErrorCode(error, ErrorCode.KubernetesPlanNotFound) ||
        IsErrorCode(error, ErrorCode.KubernetesPlanNotForNodes) ||
        IsErrorCode(error, ErrorCode.KubernetesPlanSoldOut)
      ) {
        setPoolErrors({ plan: getErrorMessage(error) });
      } else if (IsErrorCode(error, ErrorCode.ClusterTooManyNodes)) {
        setPoolErrors({ count: getErrorMessage(error) });
      } else if (
        IsErrorCode(error, ErrorCode.KubernetesRegionNotFound) ||
        IsErrorCode(error, ErrorCode.KubernetesRegionNotSold)
      ) {
        setRegionError(getErrorMessage(error));
      } else if (IsErrorCode(error, ErrorCode.KubernetesVersionNotOffered)) {
        setVersionError(getErrorMessage(error));
      } else {
        setFormError(getErrorMessage(error));
        if (IsErrorCode(error, ErrorCode.KubernetesPaymentMethodRequired))
          setBillingLink("card");
        if (IsErrorCode(error, ErrorCode.KubernetesTeamSuspended)) setBillingLink("invoice");
      }
    } finally {
      setLoading(false);
    }
  };

  const billingHref =
    currentTeam && billingLink
      ? billingPath(
          billingLink === "card" ? "payment-methods" : "invoices",
          null,
          currentTeam.id
        )
      : null;

  return (
    <div className="flex flex-col gap-field">
      {formError && (
        <NoderaAlert
          variant="error"
          message={formError}
          description={
            billingHref && canPay ? (
              <NoderaLink href={billingHref}>
                {billingLink === "card" ? t("addCard") : t("payInvoice")}
              </NoderaLink>
            ) : billingLink ? (
              t("askBilling")
            ) : undefined
          }
        />
      )}
      <KubernetesNameField
        label={t("name")}
        placeholder={t("namePlaceholder")}
        hint={t("nameHint")}
        value={name}
        onChange={setName}
        maxLength={CLUSTER_NAME_MAX_LENGTH}
        serverError={nameError}
        touched={touched}
        disabled={loading}
        autoFocus
        onEnter={handleSubmit}
      />
      <NoderaSelect
        label={t("region")}
        value={region}
        onChange={(value) => {
          setRegion(value);
          setRegionError(null);
        }}
        options={regions.map((item) => ({
          value: item.code,
          label: t("regionOption", {
            code: item.code,
            city: item.city,
            country: item.country,
          }),
        }))}
        placeholder={t("regionPlaceholder")}
        hint={t("regionHint")}
        error={regionError}
        disabled={loading}
        required
      />
      <NoderaSelect
        label={t("version")}
        value={version}
        onChange={(value) => {
          setVersion(value);
          setVersionError(null);
        }}
        options={versions.map((item) => ({ value: item.version, label: `v${item.version}` }))}
        placeholder={t("versionPlaceholder")}
        hint={t("versionHint")}
        error={versionError}
        disabled={loading}
        required
      />
      <div className="flex flex-col gap-1 border-t border-border pt-4">
        <h3 className="text-sm font-semibold text-text">{t("poolTitle")}</h3>
        <p className="text-xs text-text-muted">{t("poolDescription")}</p>
      </div>
      <NodePoolFields
        value={pool}
        onChange={setPool}
        plans={plans}
        errors={poolErrors}
        touched={touched}
        disabled={loading}
        onEnter={handleSubmit}
      />
      <NoderaAlert variant="info" message={t("noteTitle")} description={t("note")} />
      <div className="flex justify-end gap-3 pt-2">
        <NoderaButton variant="outlined" onClick={onCancel} disabled={loading}>
          {t("cancel")}
        </NoderaButton>
        <NoderaButton variant="filled" onClick={handleSubmit} loading={loading}>
          {t("submit")}
        </NoderaButton>
      </div>
    </div>
  );
}
