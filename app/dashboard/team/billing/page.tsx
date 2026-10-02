"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { App } from "antd";
import { useTranslations } from "next-intl";
import { GetProfile } from "@/api/billing";
import {
  BILLING_TAB_PARAM,
  BILLING_TEAM_PARAM,
  type BillingProfile,
  type BillingTabKey,
  CARD_ADDED_PARAM,
  DEFAULT_BILLING_TAB,
  INVOICE_PARAM,
  billingPath,
  isBillingTab,
  notifyBillingStatusChanged,
} from "@/core/billing";
import { ErrorCode } from "@/core/error";
import useTeam from "@/contexts/TeamContext/useTeam";
import { useCan } from "@/hooks/Authz/useCan";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { useNavigate } from "@/hooks/Navigation/useNavigate";
import { IsErrorCode } from "@/utils/error";
import BillingProfileForm from "@/components/Billing/BillingProfileForm";
import BillingTabs from "@/components/Billing/BillingTabs";
import InvoicesPanel from "@/components/Billing/InvoicesPanel";
import PaymentMethodsPanel from "@/components/Billing/PaymentMethodsPanel";
import UsagePanel from "@/components/Billing/UsagePanel";
import Card from "@/components/Card";
import EmptyBox from "@/components/EmptyBox";
import Loading from "@/components/Loading";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import PageHeader from "@/components/PageHeader";
import TeamTabs from "@/components/Teams/TeamTabs";
import type { TeamTabKey } from "@/components/Teams/TeamTabs/type";

const TEAM_PATH = "/dashboard/team";
const SSH_KEYS_PATH = "/dashboard/team/ssh-keys";

function BillingContent() {
  const t = useTranslations("billing");
  const searchParams = useSearchParams();
  const { message } = App.useApp();
  const { navigate } = useNavigate();
  const { getErrorMessage } = useErrorMessage();
  const {
    teams,
    currentTeam,
    isLoading: teamsLoading,
    error: teamsError,
    reload,
    selectTeam,
  } = useTeam();
  const canManage = useCan("team.manage");
  const canRead = useCan("billing.read");
  const canWrite = useCan("billing.write");

  const invoiceParam = searchParams.get(INVOICE_PARAM);
  const requestedTab = searchParams.get(BILLING_TAB_PARAM);
  const teamParam = searchParams.get(BILLING_TEAM_PARAM);
  // An invoice link (from the emails) always lands on the Invoices tab, whatever `tab` says.
  const active: BillingTabKey = invoiceParam
    ? "invoices"
    : isBillingTab(requestedTab)
      ? requestedTab
      : DEFAULT_BILLING_TAB;
  const added = searchParams.get(CARD_ADDED_PARAM);

  // An emailed link names its Team. A member is switched to it; anyone else sees "not found"
  // rather than another Team's billing under the wrong name.
  const linkedTeamKnown = !!teamParam && teams.some((team) => team.id === teamParam);
  const teamMismatch = !!teamParam && !teamsLoading && currentTeam?.id !== teamParam;
  const teamNotFound = teamMismatch && !linkedTeamKnown;

  useEffect(() => {
    if (!teamParam || teamsLoading) return;
    if (currentTeam?.id !== teamParam) {
      if (linkedTeamKnown) selectTeam(teamParam);
      return;
    }
    // Applied: the parameter leaves the URL so a later switch in the Team menu is not undone.
    navigate(billingPath(active, invoiceParam), { replace: true });
  }, [teamParam, teamsLoading, currentTeam?.id, linkedTeamKnown]);

  const [profile, setProfile] = useState<BillingProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const teamId = currentTeam?.id ?? null;
  // The Team the page currently shows: a profile answer for a Team switched away from is dropped.
  const shownTeam = useRef(teamId);

  useEffect(() => {
    shownTeam.current = teamId;
  }, [teamId]);

  const loadProfile = useCallback(async () => {
    if (!teamId || !canRead) return;
    setProfileLoading(true);
    setProfileError(null);
    try {
      const response = await GetProfile(teamId);
      if (shownTeam.current !== teamId) return;
      setProfile(response.data);
    } catch (err) {
      if (shownTeam.current !== teamId) return;
      // A Team without a profile answers 404: that is the empty form, not an error.
      if (IsErrorCode(err, ErrorCode.BillingProfileNotFound)) setProfile(null);
      else setProfileError(getErrorMessage(err));
    } finally {
      if (shownTeam.current === teamId) setProfileLoading(false);
    }
  }, [teamId, canRead, getErrorMessage]);

  useEffect(() => {
    if (teamsLoading || teamMismatch) return;
    setProfile(null);
    loadProfile();
  }, [loadProfile, teamsLoading, teamMismatch]);

  // A Role without billing.read has no Billing tab; a typed URL lands on Members.
  useEffect(() => {
    if (!teamsLoading && !teamMismatch && currentTeam && !canRead) {
      navigate(TEAM_PATH, { replace: true });
    }
  }, [teamsLoading, teamMismatch, currentTeam, canRead, navigate]);

  // The card completion page comes back with the new card's last four digits once.
  useEffect(() => {
    if (!added) return;
    message.success(t("cardAdded", { last4: added }));
    notifyBillingStatusChanged();
    navigate(billingPath("payment-methods"), { replace: true });
  }, [added]);

  const openTeamTab = (key: TeamTabKey) => {
    if (key === "billing") return;
    if (key === "sshKeys") {
      navigate(SSH_KEYS_PATH);
      return;
    }
    navigate(key === "members" ? TEAM_PATH : `${TEAM_PATH}?tab=${key}`);
  };

  const openTab = (tab: BillingTabKey) => navigate(billingPath(tab));
  const openInvoice = (invoiceId: string | null) =>
    navigate(billingPath("invoices", invoiceId));

  const header = (
    <>
      <PageHeader
        title={t("title")}
        description={
          currentTeam && !teamMismatch
            ? t("description", { team: currentTeam.name })
            : undefined
        }
      />
      <TeamTabs
        active="billing"
        showInvitations={canManage}
        showBilling={canRead}
        onChange={openTeamTab}
      />
    </>
  );

  if (teamNotFound) {
    return (
      <>
        <PageHeader title={t("title")} />
        <Card className="mx-auto w-full max-w-xl">
          <EmptyBox
            title={t("teamNotFoundTitle")}
            description={t("teamNotFound")}
            actionLabel={currentTeam ? t("openCurrentTeam") : undefined}
            onAction={
              currentTeam
                ? () => navigate(billingPath(active, invoiceParam), { replace: true })
                : undefined
            }
          />
        </Card>
      </>
    );
  }

  if (teamsLoading || teamMismatch || (currentTeam && !canRead)) {
    return (
      <>
        {header}
        <Loading />
      </>
    );
  }

  if (teamsError || !currentTeam) {
    return (
      <>
        {header}
        <div className="flex flex-col items-start gap-3">
          <NoderaAlert
            variant="error"
            message={teamsError ?? t("noTeam")}
            className="w-full"
          />
          <NoderaButton variant="outlined" onClick={reload}>
            {t("retry")}
          </NoderaButton>
        </div>
      </>
    );
  }

  let panel: React.ReactNode;
  if (active === "profile") {
    panel = profileLoading ? (
      <Loading />
    ) : profileError ? (
      <div className="flex flex-col items-start gap-3">
        <NoderaAlert variant="error" message={profileError} className="w-full" />
        <NoderaButton variant="outlined" onClick={loadProfile}>
          {t("retry")}
        </NoderaButton>
      </div>
    ) : (
      <BillingProfileForm
        key={currentTeam.id}
        teamId={currentTeam.id}
        profile={profile}
        canWrite={canWrite}
        onSaved={setProfile}
      />
    );
  } else if (active === "payment-methods") {
    panel = (
      <PaymentMethodsPanel
        key={currentTeam.id}
        teamId={currentTeam.id}
        canWrite={canWrite}
        onOpenProfile={() => openTab("profile")}
      />
    );
  } else if (active === "invoices") {
    panel = (
      <InvoicesPanel
        key={currentTeam.id}
        teamId={currentTeam.id}
        canWrite={canWrite}
        openInvoiceId={invoiceParam}
        onOpenInvoice={openInvoice}
      />
    );
  } else {
    panel = <UsagePanel key={currentTeam.id} teamId={currentTeam.id} />;
  }

  return (
    <>
      {header}
      <BillingTabs active={active} onChange={openTab} />
      {panel}
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <BillingContent />
    </Suspense>
  );
}
