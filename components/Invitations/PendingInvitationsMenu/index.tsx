"use client";

import { useState } from "react";
import { App, Badge, Dropdown } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { useLocale, useTranslations } from "next-intl";
import type { Invitation } from "@/core/invitation";
import useInvitations from "@/contexts/InvitationContext/useInvitations";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { useNavigate } from "@/hooks/Navigation/useNavigate";
import { formatDate } from "@/utils/date";
import NoderaButton from "@/components/NoderaButton";

/** Navbar bell: the count of pending Invitations and a list to accept or decline inline. */
export default function PendingInvitationsMenu() {
  const t = useTranslations("invitations.pending");
  const tr = useTranslations("teams.roles");
  const locale = useLocale();
  const { message } = App.useApp();
  const { navigate } = useNavigate();
  const { getErrorMessage } = useErrorMessage();
  const { invitations, accept, decline } = useInvitations();
  const [open, setOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const handleAccept = async (invitation: Invitation) => {
    setBusyId(invitation.id);
    try {
      const team = await accept(invitation);
      message.success(t("accepted", { team: team.name }));
      setOpen(false);
      navigate("/dashboard");
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleDecline = async (invitation: Invitation) => {
    setBusyId(invitation.id);
    try {
      await decline(invitation);
      message.success(t("declined", { team: invitation.teamName }));
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const panel = (
    <div className="w-[340px] max-w-[calc(100vw-2rem)] rounded-card border border-border bg-surface p-2 shadow-card">
      <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
        {t("label")}
      </p>
      {invitations.length === 0 ? (
        <p className="px-3 pb-3 text-sm text-text-muted">{t("empty")}</p>
      ) : (
        <ul className="flex max-h-[360px] flex-col gap-1 overflow-y-auto">
          {invitations.map((invitation) => (
            <li key={invitation.id} className="flex flex-col gap-2 rounded-button px-3 py-2">
              <span className="text-sm text-text">
                {t("invitedBy", {
                  name: invitation.invitedBy?.fullName ?? "",
                  team: invitation.teamName,
                  role: tr(invitation.role),
                })}
              </span>
              <span className="text-xs text-text-muted">
                {t("expires", { date: formatDate(invitation.expiresAt, locale) })}
              </span>
              <span className="flex items-center gap-2">
                <NoderaButton
                  variant="filled"
                  size="small"
                  loading={busyId === invitation.id}
                  onClick={() => handleAccept(invitation)}
                >
                  {t("accept")}
                </NoderaButton>
                <NoderaButton
                  variant="text"
                  size="small"
                  disabled={busyId === invitation.id}
                  onClick={() => handleDecline(invitation)}
                >
                  {t("decline")}
                </NoderaButton>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <Dropdown
      open={open}
      onOpenChange={setOpen}
      trigger={["click"]}
      placement="bottomRight"
      popupRender={() => panel}
    >
      <button
        type="button"
        aria-label={t("label")}
        className="flex size-10 items-center justify-center rounded-button text-text-muted hover:bg-surface-raised hover:text-text"
      >
        <Badge count={invitations.length} size="small" offset={[2, -2]}>
          <MailOutlined className="text-lg" />
        </Badge>
      </button>
    </Dropdown>
  );
}
