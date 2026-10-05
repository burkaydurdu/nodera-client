"use client";

import { useState } from "react";
import { App } from "antd";
import type { MenuProps } from "antd";
import {
  CheckOutlined,
  CreditCardOutlined,
  PlusOutlined,
  SettingOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import classNames from "classnames";
import { useTranslations } from "next-intl";
import { BILLING_PATH } from "@/core/billing";
import { TEAM_PATH } from "@/core/routes";
import type { Team } from "@/core/team";
import useTeam from "@/contexts/TeamContext/useTeam";
import { useCan } from "@/hooks/Authz/useCan";
import { useNavigate } from "@/hooks/Navigation/useNavigate";
import NoderaMenuButton from "@/components/NoderaMenuButton";
import CreateTeamModal from "@/components/Teams/CreateTeamModal";
import RoleBadge from "@/components/Teams/RoleBadge";
import type { TeamSwitcherProps } from "./type";

const NEW_TEAM_KEY = "__new_team__";
const SETTINGS_KEY = "__team_settings__";
const BILLING_KEY = "__team_billing__";

/**
 * Current Team name as a dropdown trigger; lists every Team, the current Team's settings and
 * Billing (reachable from either App), and a "New team" action.
 */
export default function TeamSwitcher({ className }: TeamSwitcherProps) {
  const t = useTranslations("teams.switcher");
  const tc = useTranslations("teams.create");
  const { message } = App.useApp();
  const { teams, currentTeam, isLoading, selectTeam, addTeam } = useTeam();
  const { navigate } = useNavigate();
  const canReadBilling = useCan("billing.read");
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
            <span className="flex min-w-0 items-center gap-2">
              <span className="truncate">{team.name}</span>
              <RoleBadge role={team.role} />
            </span>
            {team.id === currentTeam?.id && <CheckOutlined className="text-brand-600" />}
          </span>
        ),
      })),
    },
    { type: "divider" },
    ...(currentTeam
      ? [
          { key: SETTINGS_KEY, icon: <SettingOutlined />, label: t("settings") },
          ...(canReadBilling
            ? [{ key: BILLING_KEY, icon: <CreditCardOutlined />, label: t("billing") }]
            : []),
          { type: "divider" as const },
        ]
      : []),
    { key: NEW_TEAM_KEY, icon: <PlusOutlined />, label: t("newTeam") },
  ];

  const handleClick: MenuProps["onClick"] = ({ key }) => {
    if (key === NEW_TEAM_KEY) {
      setModalOpen(true);
      return;
    }
    if (key === SETTINGS_KEY) {
      navigate(TEAM_PATH);
      return;
    }
    if (key === BILLING_KEY) {
      navigate(BILLING_PATH);
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
      <NoderaMenuButton
        icon={<TeamOutlined />}
        label={currentTeam?.name ?? (isLoading ? t("loading") : t("noTeam"))}
        ariaLabel={t("label")}
        menu={{
          items,
          onClick: handleClick,
          selectedKeys: currentTeam ? [currentTeam.id] : [],
        }}
        disabled={isLoading}
        className={classNames("max-w-[240px]", className)}
      />
      <CreateTeamModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleCreated}
      />
    </>
  );
}
