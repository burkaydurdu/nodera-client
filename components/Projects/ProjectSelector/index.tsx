"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { App } from "antd";
import type { MenuProps } from "antd";
import {
  CheckOutlined,
  FolderOutlined,
  PlusOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import classNames from "classnames";
import { useTranslations } from "next-intl";
import { appHomePath, switchProjectPath } from "@/core/apps";
import { type Project, projectSettingsPath } from "@/core/project";
import useProjects from "@/contexts/ProjectContext/useProjects";
import useTeam from "@/contexts/TeamContext/useTeam";
import { useCan } from "@/hooks/Authz/useCan";
import { useNavigate } from "@/hooks/Navigation/useNavigate";
import NoderaMenuButton from "@/components/NoderaMenuButton";
import CreateProjectModal from "@/components/Projects/CreateProjectModal";
import type { ProjectSelectorProps } from "./type";

type MenuItems = NonNullable<MenuProps["items"]>;

const SETTINGS_KEY = "__project_settings__";
const NEW_PROJECT_KEY = "__new_project__";
const EMPTY_KEY = "__no_projects__";

/**
 * The Project both Apps work in, next to the Team switcher. It shows the remembered Project; a
 * switch opens the same section of the other Project, or only remembers it on a page that is
 * not about a Project.
 */
export default function ProjectSelector({ app, className }: ProjectSelectorProps) {
  const t = useTranslations("dashboard.projectSelector");
  const pathname = usePathname();
  const { message } = App.useApp();
  const { navigate } = useNavigate();
  const { currentTeam, isLoading: teamsLoading, rememberProject } = useTeam();
  const { projects, currentProject, isLoading, addProject } = useProjects();
  const canCreate = useCan("project.write");
  const [modalOpen, setModalOpen] = useState(false);

  const loading = teamsLoading || isLoading;

  const actions: MenuItems = [];
  if (currentProject) {
    actions.push({ key: SETTINGS_KEY, icon: <SettingOutlined />, label: t("settings") });
  }
  if (canCreate && currentTeam) {
    actions.push({ key: NEW_PROJECT_KEY, icon: <PlusOutlined />, label: t("newProject") });
  }

  const items: MenuItems = [
    {
      type: "group",
      label: t("label"),
      children:
        projects.length > 0
          ? projects.map((project) => ({
              key: project.id,
              icon: <FolderOutlined />,
              label: (
                <span className="flex items-center justify-between gap-4">
                  <span className="truncate">{project.name}</span>
                  {project.id === currentProject?.id && (
                    <CheckOutlined className="text-brand-600" />
                  )}
                </span>
              ),
            }))
          : [{ key: EMPTY_KEY, label: t("empty"), disabled: true }],
    },
    ...(actions.length > 0 ? [{ type: "divider" as const }, ...actions] : []),
  ];

  const handleClick: MenuProps["onClick"] = ({ key }) => {
    if (key === NEW_PROJECT_KEY) {
      setModalOpen(true);
      return;
    }
    if (key === SETTINGS_KEY) {
      if (currentProject) navigate(projectSettingsPath(currentProject.id));
      return;
    }
    const projectId = String(key);
    if (!projects.some((project) => project.id === projectId)) return;
    rememberProject(projectId);
    const target = switchProjectPath(pathname, projectId);
    if (target && target !== pathname) navigate(target);
  };

  const handleCreated = (project: Project) => {
    addProject(project);
    setModalOpen(false);
    message.success(t("created", { name: project.name }));
    navigate(appHomePath(app, project.id));
  };

  return (
    <>
      <NoderaMenuButton
        icon={<FolderOutlined />}
        label={currentProject?.name ?? (loading ? t("loading") : t("none"))}
        ariaLabel={t("label")}
        menu={{
          items,
          onClick: handleClick,
          selectedKeys: currentProject ? [currentProject.id] : [],
        }}
        disabled={loading || !currentTeam}
        className={classNames("max-w-[220px]", className)}
      />
      {currentTeam && (
        <CreateProjectModal
          open={modalOpen}
          teamId={currentTeam.id}
          onClose={() => setModalOpen(false)}
          onCreated={handleCreated}
        />
      )}
    </>
  );
}
