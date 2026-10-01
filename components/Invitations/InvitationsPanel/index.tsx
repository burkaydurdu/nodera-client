"use client";

import { useCallback, useEffect, useState } from "react";
import { App } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import { ListTeamInvitations, ResendInvitation, RevokeInvitation } from "@/api/invitations";
import type { Invitation } from "@/core/invitation";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import Card from "@/components/Card";
import EmptyBox from "@/components/EmptyBox";
import InvitationTable from "@/components/Invitations/InvitationTable";
import InviteMemberModal from "@/components/Invitations/InviteMemberModal";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import type { InvitationsPanelProps } from "./type";

/** The Invitations tab (owners): every Invitation of the Team, invite, resend and revoke. */
export default function InvitationsPanel({ team }: InvitationsPanelProps) {
  const t = useTranslations("invitations");
  const { message, modal } = App.useApp();
  const { getErrorMessage } = useErrorMessage();

  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ListTeamInvitations(team.id);
      setInvitations(response.data ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [team.id, getErrorMessage]);

  useEffect(() => {
    setModalOpen(false);
    load();
  }, [load]);

  const handleCreated = (invitation: Invitation) => {
    setInvitations((list) => [invitation, ...list]);
    setModalOpen(false);
    message.success(t("form.sent", { email: invitation.email }));
  };

  // Errors (429 cooldown included) are the button's to show; it owns the per-row countdown.
  const resend = async (invitation: Invitation) => {
    const response = await ResendInvitation(team.id, invitation.id);
    if (response.data) {
      setInvitations((list) =>
        list.map((item) => (item.id === invitation.id ? response.data : item))
      );
    }
  };

  const confirmRevoke = (invitation: Invitation) => {
    modal.confirm({
      title: t("revokeTitle", { email: invitation.email }),
      content: t("revokeConfirm"),
      okText: t("revoke"),
      okButtonProps: { danger: true },
      cancelText: t("cancel"),
      centered: true,
      onOk: async () => {
        setRevokingId(invitation.id);
        try {
          await RevokeInvitation(team.id, invitation.id);
          setInvitations((list) =>
            list.map((item) =>
              item.id === invitation.id ? { ...item, status: "revoked" } : item
            )
          );
          message.success(t("revoked", { email: invitation.email }));
        } catch (err) {
          message.error(getErrorMessage(err));
        } finally {
          setRevokingId(null);
        }
      },
    });
  };

  const inviteButton = (
    <NoderaButton
      variant="filled"
      size="small"
      icon={<PlusOutlined />}
      onClick={() => setModalOpen(true)}
    >
      {t("invite")}
    </NoderaButton>
  );

  return (
    <>
      <Card
        title={t("title")}
        description={t("description", { team: team.name })}
        flush
        extra={inviteButton}
      >
        {error ? (
          <div className="flex flex-col items-start gap-3 px-6 pb-6">
            <NoderaAlert variant="error" message={error} className="w-full" />
            <NoderaButton variant="outlined" size="small" onClick={load}>
              {t("retry")}
            </NoderaButton>
          </div>
        ) : !loading && invitations.length === 0 ? (
          <div className="px-6 pb-8">
            <EmptyBox
              title={t("emptyTitle")}
              description={t("emptyDescription")}
              actionLabel={t("invite")}
              onAction={() => setModalOpen(true)}
            />
          </div>
        ) : (
          <InvitationTable
            invitations={invitations}
            loading={loading}
            revokingId={revokingId}
            onResend={resend}
            onRevoke={confirmRevoke}
          />
        )}
      </Card>
      <InviteMemberModal
        open={modalOpen}
        teamId={team.id}
        onClose={() => setModalOpen(false)}
        onCreated={handleCreated}
      />
    </>
  );
}
