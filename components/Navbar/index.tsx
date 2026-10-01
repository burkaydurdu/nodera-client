"use client";

import { Avatar, Dropdown } from "antd";
import type { MenuProps } from "antd";
import { LogoutOutlined, MenuOutlined, UserOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import Link from "next/link";
import useAuth from "@/contexts/AuthContext/useAuth";
import { useNavigate } from "@/hooks/Navigation/useNavigate";
import LanguageSwitch from "@/components/LanguageSwitch";
import NoderaLogo from "@/components/NoderaLogo";
import TeamSwitcher from "@/components/Teams/TeamSwitcher";
import type { NavbarProps } from "./type";

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

export default function Navbar({ onToggleMenu }: NavbarProps) {
  const t = useTranslations("navbar");
  const { currentUser, logout } = useAuth();
  const { navigate } = useNavigate();

  const items: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: t("profile"),
      onClick: () => navigate("/dashboard/profile"),
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: t("signOut"),
      danger: true,
      onClick: async () => {
        await logout();
        navigate("/login", { replace: true });
      },
    },
  ];

  return (
    <div className="flex h-16 items-center justify-between border-b border-border bg-surface px-4 sm:px-6">
      <div className="flex items-center gap-3">
        {onToggleMenu && (
          <button
            type="button"
            onClick={onToggleMenu}
            aria-label={t("toggleMenu")}
            className="flex size-10 items-center justify-center rounded-button text-text-muted hover:bg-surface-raised lg:hidden"
          >
            <MenuOutlined />
          </button>
        )}
        <Link href="/dashboard" className="flex items-center">
          <NoderaLogo size={26} />
        </Link>
        {currentUser && (
          <>
            <span className="hidden h-6 w-px bg-border sm:block" aria-hidden />
            <TeamSwitcher className="hidden sm:flex" />
          </>
        )}
      </div>
      <div className="flex items-center gap-4">
        <LanguageSwitch />
        {currentUser && (
          <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight">
            <button
              type="button"
              className="flex items-center gap-3 rounded-button px-2 py-1.5 text-left hover:bg-surface-raised"
            >
              <Avatar className="bg-brand-600 text-text-inverse" size={34}>
                {initialsOf(currentUser.fullName) || <UserOutlined />}
              </Avatar>
              <span className="hidden flex-col leading-tight sm:flex">
                <span className="text-sm font-medium text-text">{currentUser.fullName}</span>
                <span className="text-xs text-text-muted">{currentUser.email}</span>
              </span>
            </button>
          </Dropdown>
        )}
      </div>
    </div>
  );
}
