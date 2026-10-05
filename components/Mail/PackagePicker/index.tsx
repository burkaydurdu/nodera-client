"use client";

import { Tag } from "antd";
import classNames from "classnames";
import { useLocale, useTranslations } from "next-intl";
import { billingPath } from "@/core/billing";
import {
  type MailPackage,
  NO_PACKAGE,
  type PackageAction,
  isCancellationScheduled,
  packageActionFor,
} from "@/core/mail";
import useTeam from "@/contexts/TeamContext/useTeam";
import { useCan } from "@/hooks/Authz/useCan";
import { formatUtcDate } from "@/utils/date";
import { formatCount } from "@/utils/number";
import { formatUsd } from "@/utils/price";
import Card from "@/components/Card";
import NoderaButton from "@/components/NoderaButton";
import NoderaLink from "@/components/NoderaLink";
import type { PackagePickerProps } from "./type";

/** The Package catalog with what choosing each one would do from the Project's current one. */
export default function PackagePicker({
  packages,
  overview,
  canWrite,
  blocked,
  busyCode,
  onSelect,
  onCancelMail,
}: PackagePickerProps) {
  const t = useTranslations("mail.packages");
  const locale = useLocale();
  const { currentTeam } = useTeam();
  const canAddCard = useCan("billing.write");
  const nextPeriod = formatUtcDate(overview.period?.end, locale);
  const scheduledDate = formatUtcDate(overview.scheduledChange?.effectiveAt, locale);
  const busy = busyCode !== null;

  const badgeFor = (action: PackageAction) => {
    if (action === "current") return <Tag color="blue">{t("current")}</Tag>;
    if (action === "keep")
      return <Tag color="blue">{t("currentUntil", { date: scheduledDate })}</Tag>;
    if (action === "scheduled") return <Tag>{t("from", { date: scheduledDate })}</Tag>;
    return null;
  };

  const buttonFor = (pkg: MailPackage, action: PackageAction) => {
    if (!canWrite || action === "current" || action === "scheduled") return null;
    const disabled = blocked !== null || busy;
    return (
      <NoderaButton
        variant={action === "choose" || action === "upgrade" ? "filled" : "outlined"}
        size="small"
        fullWidth
        loading={busyCode === pkg.code}
        disabled={disabled && busyCode !== pkg.code}
        onClick={() => onSelect(pkg, action)}
      >
        {t(`actions.${action}`)}
      </NoderaButton>
    );
  };

  const canCancel = canWrite && !!overview.package && !isCancellationScheduled(overview);

  return (
    <Card
      title={overview.package ? t("changeTitle") : t("chooseTitle")}
      description={t("description")}
    >
      <div className="flex flex-col gap-4">
        {blocked && canWrite && (
          <p className="text-sm text-warning">
            {t(`blocked.${blocked}`)}{" "}
            {canAddCard && currentTeam && (
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {packages.map((pkg) => {
            const action = packageActionFor(pkg, overview);
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
                    {t("emailsPerMonth", { count: formatCount(pkg.monthlyEmails, locale) })}
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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-4 text-text-muted">
            {t("rules")}{" "}
            {overview.package && nextPeriod ? t("downgradeRule", { date: nextPeriod }) : ""}
          </p>
          {canCancel && (
            <NoderaButton
              variant="text"
              size="small"
              onClick={onCancelMail}
              loading={busyCode === NO_PACKAGE}
              disabled={busy && busyCode !== NO_PACKAGE}
              className="shrink-0 text-danger!"
            >
              {t("cancelMail")}
            </NoderaButton>
          )}
        </div>
        {!canWrite && <p className="text-xs text-text-muted">{t("readOnly")}</p>}
      </div>
    </Card>
  );
}
