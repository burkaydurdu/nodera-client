"use client";

import { useState } from "react";
import { App, Dropdown } from "antd";
import type { MenuProps } from "antd";
import { CheckOutlined, DownOutlined, PlusOutlined, TeamOutlined } from "@ant-design/icons";
import classNames from "classnames";
import { useTranslations } from "next-intl";
import type { Team } from "@/core/team";
import useTeam from "@/contexts/TeamContext/useTeam";
import CreateTeamModal from "@/components/Teams/CreateTeamModal";
import type { TeamSwitcherProps } from "./type";

const NEW_TEAM_KEY = "__new_team__";

/** Current Team name as a dropdown trigger; lists every Team plus a "New team" action. */
export default function TeamSwitcher({ className }: TeamSwitcherProps) {
  const t = useTranslations("teams.switcher");
  const tc = useTranslations("teams.create");
  const { message } = App.useApp();
  const { teams, currentTeam, isLoading, selectTeam, addTeam } = useTeam();
  const [modalOpen, setModalOpen] = useState(false);

  const items: MenuProps["items"] = [
    {
      type: "group",
      label: t("label"),
      children: teams.map((team) => ({
        key: team.id,
        icon: <TeamOutlined />,
        label: (
          <span className="flex items-center justify-between gap-4">
            <span className="truncate">{team.name}</span>
            {team.id === currentTeam?.id && <CheckOutlined className="text-brand-600" />}
          </span>
        ),
      })),
    },
    { type: "divider" },
    { key: NEW_TEAM_KEY, icon: <PlusOutlined />, label: t("newTeam") },
  ];

  const handleClick: MenuProps["onClick"] = ({ key }) => {
    if (key === NEW_TEAM_KEY) {
      setModalOpen(true);
      return;
    }
    selectTeam(String(key));
  };

  const handleCreated = (team: Team) => {
    addTeam(team);
    setModalOpen(false);
    message.success(tc("success", { name: team.name }));
  };

  return (
    <>
      <Dropdown
        menu={{
          items,
          onClick: handleClick,
          selectedKeys: currentTeam ? [currentTeam.id] : [],
        }}
        trigger={["click"]}
        placement="bottomLeft"
        disabled={isLoading}
      >
        <button
          type="button"
          aria-label={t("label")}
          className={classNames(
            "flex h-10 max-w-[240px] items-center gap-2 rounded-button border border-border bg-surface px-3 text-sm font-medium text-text hover:border-brand-300 hover:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-60",
            className
          )}
          disabled={isLoading}
        >
          <TeamOutlined className="text-text-muted" />
          <span className="truncate">
            {currentTeam?.name ?? (isLoading ? t("loading") : t("noTeam"))}
          </span>
          <DownOutlined className="text-xs text-text-muted" />
        </button>
      </Dropdown>
      <CreateTeamModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleCreated}
      />
    </>
  );
}
