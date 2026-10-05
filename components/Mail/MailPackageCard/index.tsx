"use client";

import { Tooltip } from "antd";
import { useLocale, useTranslations } from "next-intl";
import { isCancellationScheduled, packageByCode } from "@/core/mail";
import { formatDate, formatUtcDate } from "@/utils/date";
import { formatCount } from "@/utils/number";
import { formatUsd } from "@/utils/price";
import Card from "@/components/Card";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import type { MailPackageCardProps } from "./type";

/** The Project's Package, and a downgrade or cancellation waiting for the next Period. */
export default function MailPackageCard({
  overview,
  packages,
  canWrite,
  blocked,
  busy,
  onUndo,
}: MailPackageCardProps) {
  const t = useTranslations("mail.package");
  const tp = useTranslations("mail.packages");
  const locale = useLocale();
  const current = overview.package;
  const scheduled = overview.scheduledChange;

  if (!current) {
    return (
      <Card title={t("title")}>
        <div className="flex flex-col gap-1">
          <span className="text-base font-semibold text-text">{t("noneTitle")}</span>
          <span className="text-sm text-text-muted">{t("none")}</span>
        </div>
      </Card>
    );
  }

  const scheduledPackage = packageByCode(packages, scheduled?.code);
  const cancelling = isCancellationScheduled(overview);
  // A Period turns over at midnight UTC; the day is read in UTC like an invoice's.
  const effective = formatUtcDate(scheduled?.effectiveAt, locale);

  return (
    <Card title={t("title")}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-2xl font-semibold leading-8 text-text">
              {current.code}
            </span>
            <span className="text-sm text-text-muted">
              {t("emailsPerMonth", { count: formatCount(current.monthlyEmails, locale) })}
            </span>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-lg font-semibold text-text">
              {t("pricePerMonth", { price: formatUsd(current.monthlyPrice) })}
            </span>
            <span className="text-xs text-text-muted">{t("taxNote")}</span>
          </div>
        </div>
        <span className="text-xs text-text-muted">
          {t("since", { date: formatDate(current.startedAt, locale) })}
        </span>
        {scheduled && (
          <NoderaAlert
            variant="info"
            message={
              cancelling
                ? t("cancellationTitle", { date: effective })
                : t("changeTitle", { package: scheduled.code, date: effective })
            }
            description={
              <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  {cancelling
                    ? t("cancellation", { package: current.code })
                    : t("change", {
                        package: scheduled.code,
                        count: scheduledPackage
                          ? formatCount(scheduledPackage.monthlyEmails, locale)
                          : scheduled.code,
                      })}
                </span>
                {canWrite && (
                  <Tooltip title={blocked && tp(`blocked.${blocked}`)}>
                    <span className="shrink-0">
                      <NoderaButton
                        variant="outlined"
                        size="small"
                        loading={busy}
                        disabled={blocked !== null}
                        onClick={onUndo}
                      >
                        {t("undo")}
                      </NoderaButton>
                    </span>
                  </Tooltip>
                )}
              </div>
            }
          />
        )}
      </div>
    </Card>
  );
}
