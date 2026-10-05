"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { App } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import { ListApiKeys, RevokeApiKey } from "@/api/apiKeys";
import { ListMembers } from "@/api/members";
import { type ApiKey, type CreatedApiKey, MAX_ACTIVE_API_KEYS } from "@/core/apiKey";
import { INTEGRATION_API_URL } from "@/core/mail";
import type { Member } from "@/core/member";
import { projectSettingsPath } from "@/core/project";
import { withoutSecret } from "@/core/secret";
import useAuth from "@/contexts/AuthContext/useAuth";
import useTeam from "@/contexts/TeamContext/useTeam";
import { useCan } from "@/hooks/Authz/useCan";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { useNavigate } from "@/hooks/Navigation/useNavigate";
import { useProjectInTeam } from "@/hooks/Project/useProjectInTeam";
import ApiKeyTable from "@/components/ApiKeys/ApiKeyTable";
import CreateApiKeyModal from "@/components/ApiKeys/CreateApiKeyModal";
import Card from "@/components/Card";
import EmptyBox from "@/components/EmptyBox";
import Loading from "@/components/Loading";
import SendTestMessage from "@/components/Mail/SendTestMessage";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import NoderaSecretModal from "@/components/NoderaSecretModal";
import PageHeader from "@/components/PageHeader";
import ProjectTabs from "@/components/Projects/ProjectTabs";
import type { ProjectTabKey } from "@/components/Projects/ProjectTabs/type";

export default function Page() {
  const { projectId } = useParams<{ projectId: string }>();
  const t = useTranslations("apiKeys");
  const { message, modal } = App.useApp();
  const { navigate } = useNavigate();
  const { getErrorMessage } = useErrorMessage();
  const { currentUser } = useAuth();
  const { currentTeam, isLoading: teamsLoading } = useTeam();
  const canWrite = useCan("apikey.write");
  const {
    project,
    missing,
    error: projectError,
    retry: retryProject,
  } = useProjectInTeam(projectId);

  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [members, setMembers] = useState<Member[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [created, setCreated] = useState<CreatedApiKey | null>(null);
  const [secretOpen, setSecretOpen] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const teamId = currentTeam?.id ?? null;
  // The Team the page shows: an answer for a Team switched away from is dropped.
  const shownTeam = useRef(teamId);

  useEffect(() => {
    shownTeam.current = teamId;
  }, [teamId]);

  // Finance never holds `apikey.write`: the whole page is hidden, a typed URL lands on settings.
  useEffect(() => {
    if (!teamsLoading && currentTeam && !canWrite) {
      navigate(projectSettingsPath(projectId), { replace: true });
    }
  }, [teamsLoading, currentTeam, canWrite, projectId, navigate]);

  const load = useCallback(async () => {
    if (!teamId || !canWrite) return;
    setLoading(true);
    setError(null);
    try {
      const [keysResponse, membersResponse] = await Promise.all([
        ListApiKeys(teamId, projectId),
        // Only names the creators; without it they read as unknown, the keys still list.
        ListMembers(teamId).catch(() => null),
      ]);
      if (shownTeam.current !== teamId) return;
      setKeys(keysResponse.data ?? []);
      setMembers(membersResponse?.data ?? null);
    } catch (err) {
      if (shownTeam.current === teamId) setError(getErrorMessage(err));
    } finally {
      if (shownTeam.current === teamId) setLoading(false);
    }
  }, [teamId, projectId, canWrite, getErrorMessage]);

  useEffect(() => {
    if (teamsLoading) return;
    setCreateOpen(false);
    load();
  }, [teamId, projectId, canWrite, teamsLoading]);

  const openTab = (key: ProjectTabKey) => {
    if (key === "general") navigate(projectSettingsPath(projectId));
  };

  const handleCreated = (key: CreatedApiKey) => {
    setCreateOpen(false);
    setKeys((list) => [
      withoutSecret(key, "key"),
      ...list.filter((item) => item.id !== key.id),
    ]);
    setCreated(key);
    setSecretOpen(true);
  };

  const confirmRevoke = (key: ApiKey) => {
    if (!teamId) return;
    modal.confirm({
      title: t("revokeTitle", { name: key.name }),
      content: t("revokeConfirm"),
      okText: t("revoke"),
      okButtonProps: { danger: true },
      cancelText: t("cancel"),
      centered: true,
      onOk: async () => {
        setRevokingId(key.id);
        try {
          await RevokeApiKey(teamId, projectId, key.id);
          setKeys((list) => list.filter((item) => item.id !== key.id));
          message.success(t("revoked", { name: key.name }));
        } catch (err) {
          message.error(getErrorMessage(err));
        } finally {
          setRevokingId(null);
        }
      },
    });
  };

  const atLimit = keys.length >= MAX_ACTIVE_API_KEYS;

  const header = (
    <>
      <PageHeader
        title={t("title")}
        description={project ? t("description", { project: project.name }) : undefined}
        extra={
          project && canWrite && keys.length > 0 ? (
            <NoderaButton
              variant="filled"
              icon={<PlusOutlined />}
              onClick={() => setCreateOpen(true)}
              disabled={atLimit}
            >
              {t("create")}
            </NoderaButton>
          ) : undefined
        }
      />
      <ProjectTabs active="apiKeys" showApiKeys={canWrite} onChange={openTab} />
    </>
  );

  if (
    teamsLoading ||
    !canWrite ||
    missing ||
    (!project && !projectError) ||
    (loading && !error && !projectError)
  ) {
    return (
      <>
        {header}
        <Loading />
      </>
    );
  }

  const shownError = projectError ?? error;
  if (shownError || !project || !currentTeam) {
    return (
      <>
        {header}
        <div className="flex flex-col items-start gap-3">
          <NoderaAlert
            variant="error"
            message={shownError ?? t("notFound")}
            className="w-full"
          />
          <NoderaButton variant="outlined" onClick={projectError ? retryProject : load}>
            {t("retry")}
          </NoderaButton>
        </div>
      </>
    );
  }

  return (
    <>
      {header}
      {atLimit && (
        <NoderaAlert
          variant="info"
          message={t("limitReached", { max: MAX_ACTIVE_API_KEYS })}
        />
      )}
      {keys.length === 0 ? (
        <Card className="mx-auto w-full max-w-xl">
          <EmptyBox
            title={t("emptyTitle")}
            description={t("emptyDescription")}
            actionLabel={t("create")}
            onAction={() => setCreateOpen(true)}
          />
        </Card>
      ) : (
        <Card flush>
          <ApiKeyTable
            keys={keys}
            members={members}
            currentUserId={currentUser?.id ?? null}
            revokingId={revokingId}
            onRevoke={confirmRevoke}
          />
        </Card>
      )}
      <p className="text-xs leading-4 text-text-muted">{t("usageHint")}</p>
      <CreateApiKeyModal
        open={createOpen}
        teamId={currentTeam.id}
        projectId={projectId}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />
      <NoderaSecretModal
        open={secretOpen}
        title={t("secret.title", { name: created?.name ?? "" })}
        description={t("secret.description")}
        secret={created?.key ?? ""}
        warning={t("secret.warning")}
        onClose={() => setSecretOpen(false)}
        afterClose={() => setCreated(null)}
      >
        {created && INTEGRATION_API_URL && (
          <SendTestMessage projectId={projectId} apiKey={created.key} />
        )}
      </NoderaSecretModal>
    </>
  );
}
