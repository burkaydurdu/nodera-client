"use client";

import { Tag, Tooltip } from "antd";
import classNames from "classnames";
import { useLocale, useTranslations } from "next-intl";
import { billingPath } from "@/core/billing";
import {
  type StoragePackage,
  type StoragePackageAction,
  fitsPackage,
  storagePackageActionFor,
} from "@/core/storageApp";
import useTeam from "@/contexts/TeamContext/useTeam";
import { useCan } from "@/hooks/Authz/useCan";
import { formatUtcDate } from "@/utils/date";
import { formatStorageSize } from "@/utils/number";
import { formatUsd } from "@/utils/price";
import Card from "@/components/Card";
import NoderaButton from "@/components/NoderaButton";
import NoderaLink from "@/components/NoderaLink";
import type { StoragePackagePickerProps } from "./type";

/**
 * The Package catalog with what choosing each one would do from the Storage's current one: a
 * larger Package applies now, a smaller one next Period, and one the Storage does not fit is
 * told so instead of being asked for and refused.
 */
export default function StoragePackagePicker({
  packages,
  storage,
  canWrite,
  blocked,
  busyCode,
  onSelect,
}: StoragePackagePickerProps) {
  const t = useTranslations("storage.packages");
  const locale = useLocale();
  const { currentTeam } = useTeam();
  const canPay = useCan("billing.write");
  const scheduledDate = formatUtcDate(storage.scheduledChange?.effectiveAt, locale);
  const busy = busyCode !== null;

  const badgeFor = (action: StoragePackageAction) => {
    if (action === "current") return <Tag color="blue">{t("current")}</Tag>;
    if (action === "keep")
      return <Tag color="blue">{t("currentUntil", { date: scheduledDate })}</Tag>;
    if (action === "scheduled") return <Tag>{t("from", { date: scheduledDate })}</Tag>;
    return null;
  };

  const buttonFor = (pkg: StoragePackage, action: StoragePackageAction) => {
    if (!canWrite || action === "current" || action === "scheduled") return null;
    const tooSmall = action === "downgrade" && !fitsPackage(pkg, storage);
    const disabled = blocked !== null || busy || tooSmall;
    const button = (
      <NoderaButton
        variant={action === "upgrade" ? "filled" : "outlined"}
        size="small"
        fullWidth
        loading={busyCode === pkg.code}
        disabled={disabled && busyCode !== pkg.code}
        onClick={() => onSelect(pkg, action)}
      >
        {t(`actions.${action}`)}
      </NoderaButton>
    );
    return tooSmall ? (
      <Tooltip title={t("tooSmall", { used: formatStorageSize(storage.usedBytes, locale) })}>
        <span className="block">{button}</span>
      </Tooltip>
    ) : (
      button
    );
  };

  return (
    <Card title={t("title")} description={t("description")}>
      <div className="flex flex-col gap-4">
        {blocked && canWrite && (
          <p className="text-sm text-warning">
            {t(`blocked.${blocked}`)}{" "}
            {canPay && currentTeam && (
              <NoderaLink
                href={
                  blocked === "suspended"
                    ? billingPath("invoices", null, currentTeam.id)
                    : billingPath("payment-methods", null, currentTeam.id)
                }
              >
                {blocked === "suspended" ? t("payInvoice") : t("addCard")}
              </NoderaLink>
            )}
          </p>
        )}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {packages.map((pkg) => {
            const action = storagePackageActionFor(pkg, storage);
            const highlighted = action === "current" || action === "keep";
            return (
              <div
                key={pkg.code}
                className={classNames(
                  "flex flex-col gap-3 rounded-card border bg-surface p-4",
                  highlighted ? "border-brand-400 ring-2 ring-brand-100" : "border-border"
                )}
              >
                <div className="flex min-h-6 items-center justify-between gap-2">
                  <span className="font-mono text-lg font-semibold text-text">{pkg.code}</span>
                  {badgeFor(action)}
                </div>
                <div className="flex flex-1 flex-col gap-0.5">
                  <span className="text-sm text-text">
                    {t("size", { size: formatStorageSize(pkg.sizeBytes, locale) })}
                  </span>
                  <span className="text-sm font-semibold text-text">
                    {t("pricePerMonth", { price: formatUsd(pkg.monthlyPrice) })}
                  </span>
                </div>
                {buttonFor(pkg, action)}
              </div>
            );
          })}
        </div>
        <p className="text-xs leading-4 text-text-muted">{t("rules")}</p>
        {!canWrite && <p className="text-xs text-text-muted">{t("readOnly")}</p>}
      </div>
    </Card>
  );
}
