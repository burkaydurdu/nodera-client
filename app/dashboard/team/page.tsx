"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import useTeam from "@/contexts/TeamContext/useTeam";
import { useCan } from "@/hooks/Authz/useCan";
import { useNavigate } from "@/hooks/Navigation/useNavigate";
import EmptyBox from "@/components/EmptyBox";
import InvitationsPanel from "@/components/Invitations/InvitationsPanel";
import Loading from "@/components/Loading";
import MembersPanel from "@/components/Members/MembersPanel";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import NoderaCopyButton from "@/components/NoderaCopyButton";
import PageHeader from "@/components/PageHeader";
import TeamTabs from "@/components/Teams/TeamTabs";
import type { TeamTabKey } from "@/components/Teams/TeamTabs/type";

const TAB_PARAM = "tab";
const SSH_KEYS_PATH = "/dashboard/team/ssh-keys";
const BILLING_PATH = "/dashboard/team/billing";

function TeamSettingsContent() {
  const t = useTranslations("teams.settings");
  const searchParams = useSearchParams();
  const { navigate } = useNavigate();
  const { currentTeam, isLoading, error, reload } = useTeam();
  const canManage = useCan("team.manage");
  const canReadBilling = useCan("billing.read");

  // The Invitations tab is owner-only; anyone else asking for it lands on Members.
  const requested = searchParams.get(TAB_PARAM);
  const active: TeamTabKey =
    requested === "invitations" && canManage ? "invitations" : "members";

  const openTab = (key: TeamTabKey) => {
    if (key === "sshKeys") {
      navigate(SSH_KEYS_PATH);
      return;
    }
    if (key === "billing") {
      navigate(BILLING_PATH);
      return;
    }
    navigate(key === "members" ? "/dashboard/team" : `/dashboard/team?${TAB_PARAM}=${key}`);
  };

  // The id is what support and the dev tooling (`make sample-notification`) ask for.
  const header = (
    <PageHeader
      title={t("title")}
      description={currentTeam ? t("description", { team: currentTeam.name }) : undefined}
      extra={
        currentTeam && (
          <span className="flex items-center gap-1 text-sm text-text-muted">
            {t("teamId")}
            <span className="font-mono text-text">{currentTeam.id}</span>
            <NoderaCopyButton value={currentTeam.id} label={t("copyTeamId")} />
          </span>
        )
      }
    />
  );

  if (isLoading) {
    return (
      <>
        {header}
        <Loading />
      </>
    );
  }

  if (error) {
    return (
      <>
        {header}
        <div className="flex flex-col items-start gap-3">
          <NoderaAlert variant="error" message={error} className="w-full" />
          <NoderaButton variant="outlined" onClick={reload}>
            {t("retry")}
          </NoderaButton>
        </div>
      </>
    );
  }

  if (!currentTeam) {
    return (
      <>
        {header}
        <EmptyBox title={t("noTeamTitle")} description={t("noTeamDescription")} />
      </>
    );
  }

  return (
    <>
      {header}
      <TeamTabs
        active={active}
        showInvitations={canManage}
        showBilling={canReadBilling}
        onChange={openTab}
      />
      {active === "invitations" ? (
        <InvitationsPanel key={currentTeam.id} team={currentTeam} />
      ) : (
        <MembersPanel key={currentTeam.id} team={currentTeam} />
      )}
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <TeamSettingsContent />
    </Suspense>
  );
}
