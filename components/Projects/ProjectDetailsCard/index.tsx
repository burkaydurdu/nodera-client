"use client";

import { useLocale, useTranslations } from "next-intl";
import { formatDateTime } from "@/utils/date";
import Card from "@/components/Card";
import NoderaCopyButton from "@/components/NoderaCopyButton";
import type { ProjectDetailsCardProps } from "./type";

/** What a Project is: its name, description, creation and the id support asks for. */
export default function ProjectDetailsCard({ project }: ProjectDetailsCardProps) {
  const t = useTranslations("dashboard.projectSettings.details");
  const locale = useLocale();

  return (
    <Card title={t("title")} description={t("description")}>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs text-text-muted">{t("name")}</dt>
          <dd className="font-medium text-text">{project.name}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs text-text-muted">{t("created")}</dt>
          <dd className="font-medium text-text">
            {formatDateTime(project.createdAt, locale)}
          </dd>
        </div>
        <div className="flex flex-col gap-0.5 sm:col-span-2">
          <dt className="text-xs text-text-muted">{t("descriptionLabel")}</dt>
          <dd className="text-text">{project.description || t("noDescription")}</dd>
        </div>
        <div className="flex flex-col gap-0.5 sm:col-span-2">
          <dt className="text-xs text-text-muted">{t("projectId")}</dt>
          <dd className="flex min-w-0 items-center gap-1">
            <span className="truncate font-mono text-text">{project.id}</span>
            <NoderaCopyButton value={project.id} label={t("copyProjectId")} />
          </dd>
        </div>
      </dl>
    </Card>
  );
}
