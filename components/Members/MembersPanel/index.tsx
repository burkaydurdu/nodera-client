"use client";

import { useCallback, useEffect, useState } from "react";
import { App } from "antd";
import { useTranslations } from "next-intl";
import { ChangeMemberRole, LeaveTeam, ListMembers, RemoveMember } from "@/api/members";
import type { Member } from "@/core/member";
import type { TeamRole } from "@/core/user";
import useAuth from "@/contexts/AuthContext/useAuth";
import useTeam from "@/contexts/TeamContext/useTeam";
import { useCan } from "@/hooks/Authz/useCan";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { useNavigate } from "@/hooks/Navigation/useNavigate";
import Card from "@/components/Card";
import MemberTable from "@/components/Members/MemberTable";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import type { MembersPanelProps } from "./type";

/** The Members tab: list, Role changes, removal and leaving, with the 409 rules surfaced. */
export default function MembersPanel({ team }: MembersPanelProps) {
  const t = useTranslations("members");
  const tr = useTranslations("teams.roles");
  const { message, modal } = App.useApp();
  const { currentUser } = useAuth();
  const { reload: reloadTeams } = useTeam();
  const { navigate } = useNavigate();
  const { getErrorMessage } = useErrorMessage();
  const canManage = useCan("team.manage");

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ListMembers(team.id);
      setMembers(response.data ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [team.id, getErrorMessage]);

  useEffect(() => {
    load();
  }, [load]);

  const changeRole = async (member: Member, role: TeamRole) => {
    if (role === member.role) return;
    setBusyUserId(member.userId);
    try {
      const response = await ChangeMemberRole(team.id, member.userId, role);
      setMembers((list) =>
        list.map((item) => (item.userId === member.userId ? response.data : item))
      );
      message.success(t("roleChanged", { name: member.fullName, role: tr(role) }));
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setBusyUserId(null);
    }
  };

  const confirmRemove = (member: Member) => {
    modal.confirm({
      title: t("removeTitle", { name: member.fullName }),
      content: t("removeConfirm", { team: team.name }),
      okText: t("remove"),
      okButtonProps: { danger: true },
      cancelText: t("cancel"),
      centered: true,
      onOk: async () => {
        setBusyUserId(member.userId);
        try {
          await RemoveMember(team.id, member.userId);
          setMembers((list) => list.filter((item) => item.userId !== member.userId));
          message.success(t("removed", { name: member.fullName }));
        } catch (err) {
          message.error(getErrorMessage(err));
        } finally {
          setBusyUserId(null);
        }
      },
    });
  };

  const confirmLeave = (member: Member) => {
    modal.confirm({
      title: t("leaveTitle", { team: team.name }),
      content: t("leaveConfirm"),
      okText: t("leave"),
      okButtonProps: { danger: true },
      cancelText: t("cancel"),
      centered: true,
      onOk: async () => {
        setBusyUserId(member.userId);
        try {
          await LeaveTeam(team.id);
          message.success(t("left", { team: team.name }));
          // The Team is gone from the list; the reload picks another one before the dashboard renders.
          await reloadTeams();
          navigate("/dashboard", { replace: true });
        } catch (err) {
          message.error(getErrorMessage(err));
          setBusyUserId(null);
        }
      },
    });
  };

  return (
    <Card title={t("title")} description={t("description", { team: team.name })} flush>
      {error ? (
        <div className="flex flex-col items-start gap-3 px-6 pb-6">
          <NoderaAlert variant="error" message={error} className="w-full" />
          <NoderaButton variant="outlined" size="small" onClick={load}>
            {t("retry")}
          </NoderaButton>
        </div>
      ) : (
        <MemberTable
          members={members}
          currentUserId={currentUser?.id ?? ""}
          canManage={canManage}
          loading={loading}
          busyUserId={busyUserId}
          onRoleChange={changeRole}
          onRemove={confirmRemove}
          onLeave={confirmLeave}
        />
      )}
    </Card>
  );
}
