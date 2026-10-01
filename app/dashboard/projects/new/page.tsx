"use client";

import { useTranslations } from "next-intl";
import type { Project } from "@/core/project";
import useTeam from "@/contexts/TeamContext/useTeam";
import { useNavigate } from "@/hooks/Navigation/useNavigate";
import Card from "@/components/Card";
import Loading from "@/components/Loading";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import PageHeader from "@/components/PageHeader";
import CreateProjectForm from "@/components/Projects/CreateProjectForm";

export default function Page() {
  const t = useTranslations("dashboard.newProject");
  const { navigate } = useNavigate();
  const { currentTeam, isLoading, error, reload, rememberProject } = useTeam();

  const handleCreated = (project: Project) => {
    rememberProject(project.id);
    navigate(`/dashboard/projects/${project.id}`, { replace: true });
  };

  return (
    <>
      <PageHeader
        title={t("title")}
        description={
          currentTeam ? t("descriptionTeam", { team: currentTeam.name }) : t("description")
        }
        breadcrumb={[
          { label: t("breadcrumbProjects"), href: "/dashboard" },
          { label: t("title") },
        ]}
      />
      {isLoading ? (
        <Loading />
      ) : error || !currentTeam ? (
        <div className="flex flex-col items-start gap-3">
          <NoderaAlert variant="error" message={error ?? t("noTeam")} className="w-full" />
          <NoderaButton variant="outlined" onClick={reload}>
            {t("retry")}
          </NoderaButton>
        </div>
      ) : (
        <Card className="max-w-xl">
          <CreateProjectForm
            key={currentTeam.id}
            teamId={currentTeam.id}
            onCreated={handleCreated}
            onCancel={() => navigate("/dashboard")}
            autoFocus
          />
        </Card>
      )}
    </>
  );
}
