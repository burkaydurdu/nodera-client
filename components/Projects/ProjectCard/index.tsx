"use client";

import { Tag } from "antd";
import { FolderOutlined } from "@ant-design/icons";
import classNames from "classnames";
import { useLocale, useTranslations } from "next-intl";
import Card from "@/components/Card";
import { formatDate } from "@/utils/date";
import type { ProjectCardProps } from "./type";

export default function ProjectCard({ project, active = false, onSelect }: ProjectCardProps) {
  const t = useTranslations("dashboard.projects");
  const locale = useLocale();

  return (
    <Card
      onClick={onSelect ? () => onSelect(project) : undefined}
      pressed={onSelect ? active : undefined}
      className={classNames("h-full", active && "border-brand-400 ring-2 ring-brand-100")}
    >
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-button bg-brand-50 text-brand-600">
            <FolderOutlined style={{ fontSize: 18 }} />
          </div>
          {active && <Tag color="blue">{t("activeBadge")}</Tag>}
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <h3 className="truncate text-base font-semibold leading-6 text-text">
            {project.name}
          </h3>
          <p className="line-clamp-2 text-sm leading-5 text-text-muted">
            {project.description}
          </p>
        </div>
        <p className="text-xs text-text-muted">
          {t("createdAt", { date: formatDate(project.createdAt, locale) })}
        </p>
      </div>
    </Card>
  );
}
