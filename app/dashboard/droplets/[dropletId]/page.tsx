"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { App } from "antd";
import { useTranslations } from "next-intl";
import { DeleteDroplet, DropletAction, GetDroplet } from "@/api/droplets";
import {
  DROPLET_POLL_INTERVAL_MS,
  type Droplet,
  type DropletActionType,
  isTransitional,
} from "@/core/droplet";
import { useCan } from "@/hooks/Authz/useCan";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { useNavigate } from "@/hooks/Navigation/useNavigate";
import { usePolling } from "@/hooks/Polling/usePolling";
import { GetStatus } from "@/utils/error";
import DropletActions from "@/components/Droplets/DropletActions";
import DropletOverview from "@/components/Droplets/DropletOverview";
import DropletSSHKeys from "@/components/Droplets/DropletSSHKeys";
import DropletStatusBadge from "@/components/Droplets/DropletStatusBadge";
import DropletTimeline from "@/components/Droplets/DropletTimeline";
import PollingStalledAlert from "@/components/Droplets/PollingStalledAlert";
import EmptyBox from "@/components/EmptyBox";
import Loading from "@/components/Loading";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import PageHeader from "@/components/PageHeader";

/** A power action's outcome arrives through the poller; keep refreshing this long after one. */
const ACTION_FOLLOW_UP_MS = 2 * 60_000;

export default function Page() {
  const { dropletId } = useParams<{ dropletId: string }>();
  const t = useTranslations("droplets.detail");
  const { message } = App.useApp();
  const { navigate } = useNavigate();
  const { getErrorMessage } = useErrorMessage();
  const canAct = useCan("droplet.write");

  const [droplet, setDroplet] = useState<Droplet | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // 0 = no follow-up window; each accepted action bumps it so the timer restarts even when a
  // window is already open, and the timer resets it to 0.
  const [followUp, setFollowUp] = useState(0);
  const inFlight = useRef(false);

  useEffect(() => {
    if (followUp === 0) return;
    const timer = setTimeout(() => setFollowUp(0), ACTION_FOLLOW_UP_MS);
    return () => clearTimeout(timer);
  }, [followUp]);

  const load = useCallback(
    async (initial: boolean) => {
      if (inFlight.current) return;
      inFlight.current = true;
      if (initial) {
        setLoading(true);
        setError(null);
        setNotFound(false);
      }
      try {
        const response = await GetDroplet(dropletId);
        setDroplet(response.data);
      } catch (err) {
        // A poll failure is the poller's to count; the page keeps showing the last good read.
        if (!initial) throw err;
        if (GetStatus(err) === 404) setNotFound(true);
        else setError(getErrorMessage(err));
      } finally {
        inFlight.current = false;
        if (initial) setLoading(false);
      }
    },
    [dropletId, getErrorMessage]
  );

  useEffect(() => {
    load(true);
  }, [load]);

  const polling = usePolling(
    () => load(false),
    DROPLET_POLL_INTERVAL_MS,
    !!droplet && (isTransitional(droplet.status) || followUp > 0)
  );

  const runAction = async (type: DropletActionType): Promise<boolean> => {
    setBusy(true);
    try {
      const response = await DropletAction(dropletId, type);
      setDroplet(response.data);
      setFollowUp((token) => token + 1);
      message.success(t("actionSent", { action: t(`actions.${type}`) }));
      return true;
    } catch (err) {
      message.error(getErrorMessage(err));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const runDelete = async (): Promise<boolean> => {
    setBusy(true);
    try {
      const response = await DeleteDroplet(dropletId);
      setDroplet(response.data);
      message.success(t("deleteSent", { hostname: response.data.hostname }));
      return true;
    } catch (err) {
      message.error(getErrorMessage(err));
      return false;
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loading />;

  if (notFound) {
    return (
      <>
        <PageHeader
          title={t("title")}
          breadcrumb={[{ label: t("breadcrumbProjects"), href: "/dashboard" }]}
        />
        <EmptyBox
          title={t("notFoundTitle")}
          description={t("notFoundDescription")}
          actionLabel={t("backToProjects")}
          onAction={() => navigate("/dashboard")}
        />
      </>
    );
  }

  if (error || !droplet) {
    return (
      <>
        <PageHeader
          title={t("title")}
          breadcrumb={[{ label: t("breadcrumbProjects"), href: "/dashboard" }]}
        />
        <div className="flex flex-col items-start gap-3">
          <NoderaAlert
            variant="error"
            message={error ?? t("notFoundTitle")}
            className="w-full"
          />
          <NoderaButton variant="outlined" onClick={() => load(true)}>
            {t("retry")}
          </NoderaButton>
        </div>
      </>
    );
  }

  const projectPath = `/dashboard/projects/${droplet.projectId}`;

  return (
    <>
      <PageHeader
        title={droplet.hostname}
        description={t("description", { region: droplet.regionCode, plan: droplet.planCode })}
        breadcrumb={[
          { label: t("breadcrumbProjects"), href: "/dashboard" },
          { label: t("breadcrumbDroplets"), href: projectPath },
          { label: droplet.hostname },
        ]}
        extra={<DropletStatusBadge status={droplet.status} />}
      />
      {droplet.status === "deleted" && (
        <NoderaAlert variant="info" message={t("deletedTitle")} description={t("deleted")} />
      )}
      {polling.stalled && <PollingStalledAlert onRetry={polling.retry} />}
      <DropletOverview droplet={droplet} />
      {canAct && (
        <DropletActions
          droplet={droplet}
          busy={busy}
          onAction={runAction}
          onDelete={runDelete}
        />
      )}
      <div className="grid grid-cols-1 gap-section lg:grid-cols-2">
        <DropletSSHKeys keys={droplet.sshKeys ?? []} />
        <DropletTimeline history={droplet.history ?? []} />
      </div>
    </>
  );
}
