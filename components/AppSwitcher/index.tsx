"use client";

import type { ReactNode } from "react";
import type { MenuProps } from "antd";
import {
  AppstoreOutlined,
  CheckOutlined,
  CloudServerOutlined,
  ClusterOutlined,
  DatabaseOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { useTranslations } from "next-intl";
import { APPS, type AppKey, appHomePath, isAppKey } from "@/core/apps";
import useTeam from "@/contexts/TeamContext/useTeam";
import { useNavigate } from "@/hooks/Navigation/useNavigate";
import NoderaMenuButton from "@/components/NoderaMenuButton";
import type { AppSwitcherProps } from "./type";

const appIcons: Record<AppKey, ReactNode> = {
  droplets: <CloudServerOutlined />,
  mail: <MailOutlined />,
  storage: <DatabaseOutlined />,
  kubernetes: <ClusterOutlined />,
};

/** Moves between the products like between apps, staying in the same Project. */
export default function AppSwitcher({ app, className }: AppSwitcherProps) {
  const t = useTranslations("apps");
  const { lastProjectId } = useTeam();
  const { navigate } = useNavigate();

  const items: MenuProps["items"] = [
    {
      type: "group",
      label: t("label"),
      children: APPS.map((key) => ({
        key,
        icon: appIcons[key],
        label: (
          <span className="flex items-center justify-between gap-6 py-1">
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-medium text-text">{t(`${key}.name`)}</span>
              <span className="text-xs text-text-muted">{t(`${key}.description`)}</span>
            </span>
            {key === app && <CheckOutlined className="text-brand-600" />}
          </span>
        ),
      })),
    },
  ];

  const handleClick: MenuProps["onClick"] = ({ key }) => {
    if (isAppKey(key)) navigate(appHomePath(key, lastProjectId));
  };

  return (
    <NoderaMenuButton
      icon={<AppstoreOutlined />}
      label={
        <span className="flex items-center gap-1.5">
          <span className="flex text-brand-600">{appIcons[app]}</span>
          {t(`${app}.name`)}
        </span>
      }
      ariaLabel={t("label")}
      menu={{ items, onClick: handleClick, selectedKeys: [app] }}
      placement="bottomRight"
      className={className}
    />
  );
}
