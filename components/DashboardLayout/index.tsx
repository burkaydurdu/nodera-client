"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  AppstoreOutlined,
  CloudServerOutlined,
  ShoppingOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import classNames from "classnames";
import { useTranslations } from "next-intl";
import Navbar from "@/components/Navbar";
import SideMenu from "@/components/SideMenu";
import type { SideMenuItem } from "@/components/SideMenu/type";
import TeamSwitcher from "@/components/Teams/TeamSwitcher";
import useTeam from "@/contexts/TeamContext/useTeam";
import type { DashboardLayoutProps } from "./type";

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const t = useTranslations("sidebar");
  const [menuOpen, setMenuOpen] = useState(false);
  const { lastProjectId } = useTeam();

  // Without a remembered Project the Droplets entry has nowhere to lead; pointing it at the
  // project list would light two entries for one page, so it is left out until one is known.
  const dropletsItem: SideMenuItem[] = lastProjectId
    ? [
        {
          key: "droplets",
          label: t("droplets"),
          href: `/dashboard/projects/${lastProjectId}`,
          icon: <CloudServerOutlined />,
          matchPrefixes: ["/dashboard/droplets/"],
        },
      ]
    : [];

  const items: SideMenuItem[] = [
    {
      key: "projects",
      label: t("projects"),
      href: "/dashboard",
      icon: <AppstoreOutlined />,
      exact: true,
    },
    ...dropletsItem,
    {
      key: "catalog",
      label: t("catalog"),
      href: "/dashboard/catalog",
      icon: <ShoppingOutlined />,
    },
    {
      key: "team",
      label: t("team"),
      href: "/dashboard/team",
      icon: <TeamOutlined />,
    },
    {
      key: "profile",
      label: t("profile"),
      href: "/dashboard/profile",
      icon: <UserOutlined />,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-surface-muted">
      <header className="sticky top-0 z-20">
        <Navbar onToggleMenu={() => setMenuOpen((open) => !open)} />
      </header>
      <div className="flex flex-1">
        <aside
          className={classNames(
            "w-60 shrink-0 border-r border-border bg-surface p-4",
            menuOpen ? "block" : "hidden lg:block"
          )}
        >
          <div className="mb-4 sm:hidden">
            <TeamSwitcher className="w-full max-w-none" />
          </div>
          <SideMenu items={items} path={pathname} />
        </aside>
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-page">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-section">{children}</div>
        </main>
      </div>
    </div>
  );
}
