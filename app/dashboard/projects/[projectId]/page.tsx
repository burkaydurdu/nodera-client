"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { PlusOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import { ListDroplets } from "@/api/droplets";
import {
  DROPLET_FALLBACK_POLL_INTERVAL_MS,
  type Droplet,
  PROJECT_ACCESS_RETRY_INTERVAL_MS,
  PROJECT_ACCESS_RETRY_MS,
  isTransitional,
} from "@/core/droplet";
import { ErrorCode } from "@/core/error";
import useTeam from "@/contexts/TeamContext/useTeam";
import { useCan } from "@/hooks/Authz/useCan";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { useNavigate } from "@/hooks/Navigation/useNavigate";
import { usePolling } from "@/hooks/Polling/usePolling";
import { useProjectInTeam } from "@/hooks/Project/useProjectInTeam";
import { useRealtimeMessage } from "@/hooks/Realtime/useRealtimeMessage";
import { useResync } from "@/hooks/Realtime/useResync";
import { IsErrorCode } from "@/utils/error";
import { retryUntil } from "@/utils/retry";
import Card from "@/components/Card";
import DropletTable from "@/components/Droplets/DropletTable";
import PollingStalledAlert from "@/components/Droplets/PollingStalledAlert";
import EmptyBox from "@/components/EmptyBox";
import Loading from "@/components/Loading";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import PageHeader from "@/components/PageHeader";

export default function Page() {
  const { projectId } = useParams<{ projectId: string }>();
  const t = useTranslations("droplets.list");
  const { navigate } = useNavigate();
  const { getErrorMessage } = useErrorMessage();
  const { isLoading: teamsLoading } = useTeam();
  const canCreate = useCan("droplet.write");
  const {
    project,
    missing: projectMissing,
    error: projectError,
    retry: retryProject,
  } = useProjectInTeam(projectId);

  const [droplets, setDroplets] = useState<Droplet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessPending, setAccessPending] = useState(false);
  // Each load takes a ticket; only the newest one may write state or clear `loading`. An
  // initial load aborted by a re-run (React re-mounts effects in development) is thus
  // superseded instead of leaving the page on its spinner, and a poll never overlaps a load.
  const ticket = useRef(0);
  const inFlight = useRef(false);

  const createPath = `/dashboard/projects/${projectId}/droplets/new`;

  const load = useCallback(
    async (initial: boolean, signal?: AbortSignal) => {
      if (!initial && inFlight.current) return;
      const mine = ++ticket.current;
      const current = () => mine === ticket.current && !signal?.aborted;
      inFlight.current = true;
      if (initial) {
        setLoading(true);
        setError(null);
      }
      try {
        // The droplet service learns a new Project from an event (ADR-0004); its own "not
        // found" right after creation clears within seconds, so the first list is retried for
        // a moment. Any other 404 is a real answer and surfaces at once.
        const response = await retryUntil(() => ListDroplets(projectId), {
          shouldRetry: (err) => initial && IsErrorCode(err, ErrorCode.AccessProjectNotFound),
          timeoutMs: PROJECT_ACCESS_RETRY_MS,
          intervalMs: PROJECT_ACCESS_RETRY_INTERVAL_MS,
          signal,
        });
        if (!current()) return;
        setDroplets(response.data ?? []);
        setAccessPending(false);
      } catch (err) {
        if (!current()) return;
        // A poll failure is the poller's to count; the list keeps showing the last good read.
        if (!initial) throw err;
        if (IsErrorCode(err, ErrorCode.AccessProjectNotFound)) setAccessPending(true);
        else setError(getErrorMessage(err));
      } finally {
        if (mine === ticket.current) {
          inFlight.current = false;
          if (initial) setLoading(false);
        }
      }
    },
    [projectId, getErrorMessage]
  );

  useEffect(() => {
    const controller = new AbortController();
    load(true, controller.signal);
    return () => controller.abort();
  }, [load]);

  const polling = usePolling(
    () => load(false),
    DROPLET_FALLBACK_POLL_INTERVAL_MS,
    droplets.some((droplet) => isTransitional(droplet.status))
  );

  useRealtimeMessage("droplet.status_changed", (change) => {
    if (change.projectId === projectId) polling.refresh();
  });
  useResync(polling.refresh);

  const createButton = canCreate ? (
    <NoderaButton
      variant="filled"
      icon={<PlusOutlined />}
      onClick={() => navigate(createPath)}
    >
      {t("create")}
    </NoderaButton>
  ) : undefined;

  const header = (
    <PageHeader
      title={project?.name ?? t("title")}
      description={project ? t("description", { project: project.name }) : undefined}
      breadcrumb={[
        { label: t("breadcrumbProjects"), href: "/dashboard" },
        { label: t("title") },
      ]}
      extra={createButton}
    />
  );

  const emptyBox = (
    <Card className="mx-auto w-full max-w-xl">
      <EmptyBox
        title={t("emptyTitle")}
        description={canCreate ? t("emptyDescription") : t("emptyReadOnly")}
        actionLabel={canCreate ? t("create") : undefined}
        onAction={canCreate ? () => navigate(createPath) : undefined}
      />
    </Card>
  );

  if (teamsLoading || loading || projectMissing) {
    return <Loading />;
  }

  if (accessPending) {
    // The create form retries the same window on submit, so the CTA is not a dead end.
    return (
      <>
        {header}
        <div className="flex flex-col items-start gap-3">
          <NoderaAlert
            variant="info"
            message={t("accessPendingTitle")}
            description={t("accessPending")}
            className="w-full"
          />
          <NoderaButton variant="outlined" onClick={() => load(true)}>
            {t("retry")}
          </NoderaButton>
        </div>
        {emptyBox}
      </>
    );
  }

  const shownError = projectError ?? error;
  if (shownError) {
    return (
      <>
        {header}
        <div className="flex flex-col items-start gap-3">
          <NoderaAlert variant="error" message={shownError} className="w-full" />
          <NoderaButton
            variant="outlined"
            onClick={() => (projectError ? retryProject() : load(true))}
          >
            {t("retry")}
          </NoderaButton>
        </div>
      </>
    );
  }

  if (droplets.length === 0) {
    return (
      <>
        {header}
        {emptyBox}
      </>
    );
  }

  return (
    <>
      {header}
      {polling.stalled && <PollingStalledAlert onRetry={polling.retry} />}
      <Card flush>
        <DropletTable
          droplets={droplets}
          onOpen={(droplet) => navigate(`/dashboard/droplets/${droplet.id}`)}
        />
      </Card>
    </>
  );
}
