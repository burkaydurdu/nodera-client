"use client";

import { useState } from "react";
import { App } from "antd";
import { useLocale, useTranslations } from "next-intl";
import { ChooseMailPackage, GetMailOverview, ListMailPackages } from "@/api/mail";
import { ErrorCode } from "@/core/error";
import {
  type MailOverview,
  type MailPackage,
  NO_PACKAGE,
  type PackageAction,
  packageBlock,
} from "@/core/mail";
import {
  PROJECT_ACCESS_RETRY_INTERVAL_MS,
  PROJECT_ACCESS_RETRY_MS,
  projectApiKeysPath,
} from "@/core/project";
import useMailProject from "@/contexts/MailProjectContext/useMailProject";
import { useCan } from "@/hooks/Authz/useCan";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { useLatestRead } from "@/hooks/Loading/useLatestRead";
import { useRealtimeMessage } from "@/hooks/Realtime/useRealtimeMessage";
import { useResync } from "@/hooks/Realtime/useResync";
import { formatUtcDate } from "@/utils/date";
import { IsErrorCode } from "@/utils/error";
import { formatCount } from "@/utils/number";
import { formatUsd } from "@/utils/price";
import { retryUntil } from "@/utils/retry";
import Loading from "@/components/Loading";
import MailPackageCard from "@/components/Mail/MailPackageCard";
import MailPauseAlert from "@/components/Mail/MailPauseAlert";
import MailRatesCard from "@/components/Mail/MailRatesCard";
import MailSendingStateAlert from "@/components/Mail/MailSendingStateAlert";
import MailUsageCard from "@/components/Mail/MailUsageCard";
import PackagePicker from "@/components/Mail/PackagePicker";
import SendApiCard from "@/components/Mail/SendApiCard";
import SmtpSettingsCard from "@/components/Mail/SmtpSettingsCard";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import PageHeader from "@/components/PageHeader";

type ConfirmedAction = Exclude<PackageAction, "current" | "scheduled" | "keep">;

export default function Page() {
  const { project } = useMailProject();
  const t = useTranslations("mail.overview");
  const tp = useTranslations("mail.packages");
  const locale = useLocale();
  const { message, modal } = App.useApp();
  const { getErrorMessage } = useErrorMessage();
  const canWrite = useCan("mail.write");
  const canManageKeys = useCan("apikey.write");
  const [busyCode, setBusyCode] = useState<string | null>(null);

  const overviewRead = useLatestRead<MailOverview | null>(
    async (first, signal) =>
      // Mail learns a Project from an event (ADR-0004): right after the Project was created
      // its overview answers "not found" for a moment, so the first read is retried briefly.
      (
        await retryUntil(() => GetMailOverview(project.id), {
          shouldRetry: (err) => first && IsErrorCode(err, ErrorCode.MailProjectNotFound),
          timeoutMs: PROJECT_ACCESS_RETRY_MS,
          intervalMs: PROJECT_ACCESS_RETRY_INTERVAL_MS,
          signal,
        })
      ).data,
    project.id,
    null
  );
  const catalogRead = useLatestRead<MailPackage[]>(
    async () => (await ListMailPackages()).data ?? [],
    "catalog",
    []
  );
  const overview = overviewRead.data;
  const packages = catalogRead.data;

  useRealtimeMessage("mail.sending_changed", (change) => {
    if (change.projectId === project.id) overviewRead.refresh();
  });
  useResync(overviewRead.refresh);

  const retry = () => {
    overviewRead.reload();
    catalogRead.reload();
  };

  const applyPackage = async (code: string, success: string) => {
    setBusyCode(code);
    try {
      const response = await ChooseMailPackage(project.id, { code });
      overviewRead.setData(response.data);
      message.success(success);
    } catch (err) {
      message.error(getErrorMessage(err));
      // The refusal may come from a change made elsewhere: the overview is read again.
      overviewRead.refresh();
    } finally {
      setBusyCode(null);
    }
  };

  const nextPeriod = formatUtcDate(overview?.period?.end, locale);

  const confirmPackage = (pkg: MailPackage, action: PackageAction) => {
    if (action === "current" || action === "scheduled") return;
    const values = {
      package: pkg.code,
      count: formatCount(pkg.monthlyEmails, locale),
      price: formatUsd(pkg.monthlyPrice),
      date: nextPeriod,
    };
    // Keeping the current Package only undoes a scheduled change: nothing to confirm.
    if (action === "keep") {
      void applyPackage(pkg.code, tp("done.keep", values));
      return;
    }
    const confirmed: ConfirmedAction = action;
    modal.confirm({
      title: tp(`confirm.${confirmed}.title`, values),
      content: tp(`confirm.${confirmed}.description`, values),
      okText: tp(`confirm.${confirmed}.ok`),
      cancelText: tp("back"),
      centered: true,
      onOk: () => applyPackage(pkg.code, tp(`done.${confirmed}`, values)),
    });
  };

  const confirmCancelMail = () => {
    if (!overview?.package) return;
    const values = { package: overview.package.code, date: nextPeriod };
    modal.confirm({
      title: tp("confirm.cancel.title"),
      content: tp("confirm.cancel.description", values),
      okText: tp("confirm.cancel.ok"),
      okButtonProps: { danger: true },
      cancelText: tp("back"),
      centered: true,
      onOk: () => applyPackage(NO_PACKAGE, tp("done.cancel", values)),
    });
  };

  const undoScheduledChange = () => {
    if (!overview?.package) return;
    void applyPackage(
      overview.package.code,
      tp("done.keep", { package: overview.package.code })
    );
  };

  const header = (
    <PageHeader title={t("title")} description={t("description", { project: project.name })} />
  );

  if (overviewRead.isLoading || catalogRead.isLoading) {
    return (
      <>
        {header}
        <Loading />
      </>
    );
  }

  const failure = overviewRead.error ?? catalogRead.error;
  if (failure || !overview) {
    return (
      <>
        {header}
        <div className="flex flex-col items-start gap-3">
          {IsErrorCode(failure, ErrorCode.MailProjectNotFound) ? (
            <NoderaAlert
              variant="info"
              message={t("accessPendingTitle")}
              description={t("accessPending")}
              className="w-full"
            />
          ) : (
            <NoderaAlert
              variant="error"
              message={failure ? getErrorMessage(failure) : t("unavailable")}
              className="w-full"
            />
          )}
          <NoderaButton variant="outlined" onClick={retry}>
            {t("retry")}
          </NoderaButton>
        </div>
      </>
    );
  }

  const blocked = packageBlock(overview);

  return (
    <>
      {header}
      {overview.pause && <MailPauseAlert pause={overview.pause} rates={overview.rates} />}
      <MailSendingStateAlert overview={overview} />
      <div className="grid grid-cols-1 gap-section lg:grid-cols-2">
        <MailPackageCard
          overview={overview}
          packages={packages}
          canWrite={canWrite}
          blocked={blocked}
          busy={busyCode !== null}
          onUndo={undoScheduledChange}
        />
        <MailUsageCard overview={overview} />
      </div>
      <PackagePicker
        packages={packages}
        overview={overview}
        canWrite={canWrite}
        blocked={blocked}
        busyCode={busyCode}
        onSelect={confirmPackage}
        onCancelMail={confirmCancelMail}
      />
      <SendApiCard
        projectId={project.id}
        apiKeysPath={canManageKeys ? projectApiKeysPath(project.id) : null}
      />
      <div className="grid grid-cols-1 gap-section lg:grid-cols-2">
        <MailRatesCard rates={overview.rates} />
        <SmtpSettingsCard
          apiKeysPath={canManageKeys ? projectApiKeysPath(project.id) : null}
        />
      </div>
    </>
  );
}
