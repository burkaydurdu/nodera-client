"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  AcceptInvitationByToken,
  DeclineInvitationByToken,
  LookupInvitation,
} from "@/api/invitations";
import { ErrorCode } from "@/core/error";
import {
  type InvitationLookup,
  isInvitationPending,
  loginWithInvitationPath,
  matchesInvitationEmail,
  registerWithInvitationPath,
} from "@/core/invitation";
import useAuth from "@/contexts/AuthContext/useAuth";
import useInvitations from "@/contexts/InvitationContext/useInvitations";
import useTeam from "@/contexts/TeamContext/useTeam";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { useNavigate } from "@/hooks/Navigation/useNavigate";
import { clearPendingInvitation, getPendingInvitation } from "@/core/storage";
import { formatDateTime } from "@/utils/date";
import { IsErrorCode } from "@/utils/error";
import AuthCardHeader from "@/components/Auth/AuthCardHeader";
import Loading from "@/components/Loading";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import NoderaLink from "@/components/NoderaLink";
import type { AcceptInvitationCardProps } from "./type";

type Outcome = "accepted" | "declined" | null;

/**
 * The email link must work in every state: signed in with the invited address, signed in
 * with another one, signed out, and for a link that is no longer valid.
 */
export default function AcceptInvitationCard({ token }: AcceptInvitationCardProps) {
  const t = useTranslations("invitations.accept");
  const tr = useTranslations("teams.roles");
  const locale = useLocale();
  const { currentUser, logout } = useAuth();
  const { addTeam } = useTeam();
  const { reload: reloadInvitations } = useInvitations();
  const { navigate } = useNavigate();
  const { getErrorMessage } = useErrorMessage();

  const [invitation, setInvitation] = useState<InvitationLookup | null>(null);
  const [loading, setLoading] = useState(!!token);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<Outcome>(null);
  const [otherAccount, setOtherAccount] = useState(false);

  // The link's token is now in hand: the entry sign-in stashed for the MFA / verification
  // detour has served its purpose and must not redirect a later sign-in here again.
  useEffect(() => {
    if (token && getPendingInvitation()?.token === token) clearPendingInvitation();
  }, [token]);

  const lookup = useCallback(async () => {
    if (!token) return;
    const response = await LookupInvitation(token);
    setInvitation(response.data);
  }, [token]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    lookup()
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [lookup]);

  // "No longer valid" (8-10002) means the Invitation moved on since the lookup: re-read it
  // so the card shows the real state instead of offering Accept / Decline again.
  const handleAnswerError = async (err: unknown) => {
    if (IsErrorCode(err, ErrorCode.InvitationForAnotherEmail)) {
      setOtherAccount(true);
      return;
    }
    if (IsErrorCode(err, ErrorCode.InvitationNoLongerValid)) {
      try {
        await lookup();
      } catch {
        setInvitation((current) => (current ? { ...current, status: "expired" } : current));
      }
      return;
    }
    setError(getErrorMessage(err));
  };

  const dashboardLink = (
    <NoderaLink href={currentUser ? "/dashboard" : "/login"}>
      {currentUser ? t("backToDashboard") : t("backToLogin")}
    </NoderaLink>
  );

  const accept = async () => {
    if (!token || busy) return;
    setBusy(true);
    setError(null);
    try {
      const response = await AcceptInvitationByToken(token);
      addTeam(response.data.team);
      reloadInvitations();
      setOutcome("accepted");
    } catch (err) {
      await handleAnswerError(err);
    } finally {
      setBusy(false);
    }
  };

  const decline = async () => {
    if (!token || busy) return;
    setBusy(true);
    setError(null);
    try {
      await DeclineInvitationByToken(token);
      reloadInvitations();
      setOutcome("declined");
    } catch (err) {
      await handleAnswerError(err);
    } finally {
      setBusy(false);
    }
  };

  const switchAccount = async () => {
    if (!token || busy) return;
    setBusy(true);
    await logout({ keepInvitation: true });
    navigate(loginWithInvitationPath(token), { replace: true });
  };

  if (!token) {
    return (
      <div className="flex flex-col gap-section">
        <AuthCardHeader title={t("title")} />
        <NoderaAlert variant="error" message={t("missingToken")} />
        <p className="text-center text-sm">{dashboardLink}</p>
      </div>
    );
  }

  if (loading) {
    return <Loading />;
  }

  if (!invitation) {
    return (
      <div className="flex flex-col gap-section">
        <AuthCardHeader title={t("title")} />
        <NoderaAlert variant="error" message={error ?? t("invalidMessage")} />
        <p className="text-center text-sm">{dashboardLink}</p>
      </div>
    );
  }

  const role = tr(invitation.role);

  if (outcome === "accepted") {
    return (
      <div className="flex flex-col gap-section">
        <AuthCardHeader
          title={t("acceptedTitle", { team: invitation.teamName })}
          subtitle={t("acceptedMessage", { role })}
        />
        <NoderaButton
          variant="filled"
          fullWidth
          onClick={() => navigate("/dashboard", { replace: true })}
        >
          {t("goToDashboard")}
        </NoderaButton>
      </div>
    );
  }

  if (outcome === "declined") {
    return (
      <div className="flex flex-col gap-section">
        <AuthCardHeader
          title={t("declinedTitle")}
          subtitle={t("declinedMessage", { team: invitation.teamName })}
        />
        <p className="text-center text-sm">{dashboardLink}</p>
      </div>
    );
  }

  if (!isInvitationPending(invitation.status)) {
    return (
      <div className="flex flex-col gap-section">
        <AuthCardHeader title={t("invalidTitle")} subtitle={t("invalidMessage")} />
        <NoderaAlert
          variant="warning"
          message={t(`status.${invitation.status}`, { team: invitation.teamName })}
        />
        <p className="text-center text-sm">{dashboardLink}</p>
      </div>
    );
  }

  const header = (
    <AuthCardHeader
      title={t("title")}
      subtitle={t("invitedText", {
        inviter: invitation.invitedByName,
        team: invitation.teamName,
        role,
      })}
    />
  );
  const expires = (
    <p className="text-center text-xs text-text-muted">
      {t("expires", { date: formatDateTime(invitation.expiresAt, locale) })}
    </p>
  );

  if (!currentUser) {
    return (
      <div className="flex flex-col gap-section">
        {header}
        <NoderaAlert
          variant="info"
          message={t("signedOutMessage", {
            email: invitation.emailHint,
            team: invitation.teamName,
          })}
        />
        <div className="flex flex-col gap-3">
          <NoderaButton
            variant="filled"
            fullWidth
            onClick={() => navigate(loginWithInvitationPath(token))}
          >
            {t("signIn")}
          </NoderaButton>
          <NoderaButton
            variant="outlined"
            fullWidth
            onClick={() => navigate(registerWithInvitationPath(token))}
          >
            {t("signUp")}
          </NoderaButton>
        </div>
        {expires}
      </div>
    );
  }

  if (otherAccount || !matchesInvitationEmail(currentUser.email, invitation)) {
    return (
      <div className="flex flex-col gap-section">
        {header}
        <NoderaAlert
          variant="warning"
          message={t("otherAccountTitle")}
          description={t("otherAccountMessage", {
            email: invitation.emailHint,
            current: currentUser.email,
          })}
        />
        <NoderaButton variant="filled" fullWidth loading={busy} onClick={switchAccount}>
          {t("switchAccount")}
        </NoderaButton>
        <p className="text-center text-sm">{dashboardLink}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-section">
      {header}
      {error && <NoderaAlert variant="error" message={error} />}
      <div className="flex flex-col gap-3">
        <NoderaButton variant="filled" fullWidth loading={busy} onClick={accept}>
          {t("accept")}
        </NoderaButton>
        <NoderaButton variant="outlined" fullWidth disabled={busy} onClick={decline}>
          {t("decline")}
        </NoderaButton>
      </div>
      {expires}
      <p className="text-center text-sm">{dashboardLink}</p>
    </div>
  );
}
