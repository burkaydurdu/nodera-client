"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { App } from "antd";
import { useTranslations } from "next-intl";
import { GetImages, GetRegions } from "@/api/catalog";
import { ListSSHKeys } from "@/api/sshKeys";
import type { Image, Region } from "@/core/catalog";
import type { Droplet } from "@/core/droplet";
import type { SSHKey } from "@/core/sshKey";
import useTeam from "@/contexts/TeamContext/useTeam";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { useNavigate } from "@/hooks/Navigation/useNavigate";
import { useProjectInTeam } from "@/hooks/Project/useProjectInTeam";
import CreateDropletForm from "@/components/Droplets/CreateDropletForm";
import Loading from "@/components/Loading";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import PageHeader from "@/components/PageHeader";

export default function Page() {
  const { projectId } = useParams<{ projectId: string }>();
  const t = useTranslations("droplets.create");
  const { message } = App.useApp();
  const { navigate } = useNavigate();
  const { getErrorMessage } = useErrorMessage();
  const {
    currentTeam,
    isLoading: teamsLoading,
    error: teamsError,
    reload,
    rememberProject,
  } = useTeam();
  // A Team switch while the form is open makes this Project foreign; the check sends the user
  // back instead of letting a Droplet be created under the wrong Team.
  const {
    missing: projectMissing,
    error: projectError,
    retry: retryProject,
  } = useProjectInTeam(projectId);

  const [regions, setRegions] = useState<Region[]>([]);
  const [images, setImages] = useState<Image[]>([]);
  const [sshKeys, setSshKeys] = useState<SSHKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const teamId = currentTeam?.id ?? null;
  const projectPath = `/dashboard/projects/${projectId}`;

  const load = useCallback(async () => {
    if (!teamId) return;
    setLoading(true);
    setError(null);
    try {
      const [regionsResponse, imagesResponse, keysResponse] = await Promise.all([
        GetRegions(),
        GetImages(),
        ListSSHKeys(teamId),
      ]);
      setRegions(regionsResponse.data ?? []);
      setImages(imagesResponse.data ?? []);
      setSshKeys(keysResponse.data ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [teamId, getErrorMessage]);

  useEffect(() => {
    if (teamsLoading) return;
    load();
  }, [load, teamsLoading]);

  const handleCreated = (droplet: Droplet) => {
    rememberProject(droplet.projectId);
    message.success(t("created", { hostname: droplet.hostname }));
    navigate(projectPath, { replace: true });
  };

  const header = (
    <PageHeader
      title={t("title")}
      description={t("description")}
      breadcrumb={[
        { label: t("breadcrumbProjects"), href: "/dashboard" },
        { label: t("breadcrumbDroplets"), href: projectPath },
        { label: t("title") },
      ]}
    />
  );

  if (teamsLoading || projectMissing || (loading && currentTeam)) {
    return (
      <>
        {header}
        <Loading />
      </>
    );
  }

  if (teamsError || !currentTeam || projectError || error) {
    const retry = teamsError || !currentTeam ? reload : projectError ? retryProject : load;
    return (
      <>
        {header}
        <div className="flex flex-col items-start gap-3">
          <NoderaAlert
            variant="error"
            message={teamsError ?? projectError ?? error ?? t("noTeam")}
            className="w-full"
          />
          <NoderaButton variant="outlined" onClick={retry}>
            {t("retry")}
          </NoderaButton>
        </div>
      </>
    );
  }

  return (
    <>
      {header}
      <CreateDropletForm
        key={currentTeam.id}
        projectId={projectId}
        teamId={currentTeam.id}
        regions={regions}
        images={images}
        sshKeys={sshKeys}
        onKeyCreated={(key) => setSshKeys((list) => [...list, key])}
        onCreated={handleCreated}
        onCancel={() => navigate(projectPath)}
      />
    </>
  );
}
