"use client";

import { InputNumber } from "antd";
import { useTranslations } from "next-intl";
import {
  MAX_NODES_PER_POOL,
  MIN_NODES_PER_POOL,
  POOL_NAME_MAX_LENGTH,
} from "@/core/kubernetesApp";
import { formatUsd } from "@/utils/price";
import KubernetesNameField from "@/components/Kubernetes/KubernetesNameField";
import NoderaSelect from "@/components/NoderaSelect";
import type { NodePoolFieldsProps } from "./type";

/**
 * The three things a Node pool is made of: a name, the Plan every Node has and how many. The
 * Plan never changes afterwards; the count does. Prices are per Node, as the Droplet catalog
 * prices them: a Node is charged as the Droplet it is.
 */
export default function NodePoolFields({
  value,
  onChange,
  plans,
  errors = {},
  touched = false,
  disabled = false,
  onEnter,
}: NodePoolFieldsProps) {
  const t = useTranslations("kubernetes.pool");
  const chosen = plans.find((plan) => plan.code === value.plan) ?? null;

  return (
    <div className="flex flex-col gap-field">
      <KubernetesNameField
        label={t("name")}
        placeholder={t("namePlaceholder")}
        hint={t("nameHint")}
        value={value.name}
        onChange={(name) => onChange({ ...value, name })}
        maxLength={POOL_NAME_MAX_LENGTH}
        serverError={errors.name ?? null}
        touched={touched}
        disabled={disabled}
        onEnter={onEnter}
      />
      <NoderaSelect
        label={t("plan")}
        value={value.plan}
        onChange={(plan) => onChange({ ...value, plan })}
        options={plans.map((plan) => ({
          value: plan.code,
          label: t("planOption", {
            code: plan.code,
            cpus: plan.cpuCount,
            ram: plan.ramGb,
            price: formatUsd(plan.hourlyPrice),
          }),
        }))}
        placeholder={t("planPlaceholder")}
        hint={
          chosen
            ? chosen.soldOut
              ? t("planSoldOut")
              : t("planChosen", {
                  monthly: formatUsd(chosen.monthlyPrice),
                  total: formatUsd((Number(chosen.monthlyPrice) * value.count).toFixed(2)),
                  count: value.count,
                })
            : t("planHint")
        }
        error={errors.plan ?? null}
        disabled={disabled}
        required
      />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-text">{t("count")}</label>
        <InputNumber
          min={MIN_NODES_PER_POOL}
          max={MAX_NODES_PER_POOL}
          value={value.count}
          onChange={(count) =>
            onChange({ ...value, count: Number(count ?? MIN_NODES_PER_POOL) })
          }
          disabled={disabled}
          status={errors.count ? "error" : undefined}
          className="w-32"
          size="large"
        />
        <span className="text-xs text-text-muted">
          {errors.count ??
            t("countHint", { min: MIN_NODES_PER_POOL, max: MAX_NODES_PER_POOL })}
        </span>
      </div>
    </div>
  );
}
