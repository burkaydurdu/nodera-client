"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  ApiOutlined,
  AppstoreOutlined,
  CloudServerOutlined,
  DashboardOutlined,
  FileSearchOutlined,
  GlobalOutlined,
  KeyOutlined,
  ShoppingOutlined,
  StopOutlined,
} from "@ant-design/icons";
import classNames from "classnames";
import { useTranslations } from "next-intl";
import { type AppKey, DEFAULT_APP, appOfPath } from "@/core/apps";
import { CATALOG_PATH } from "@/core/catalog";
import { DROPLETS_PATH, projectDropletsPath } from "@/core/droplet";
import { MAIL_LANDING_PATH, mailPath } from "@/core/mail";
import { projectApiKeysPath, projectPath } from "@/core/project";
import { DASHBOARD_PATH } from "@/core/routes";
import { getLastApp, setLastApp } from "@/core/storage";
import useTeam from "@/contexts/TeamContext/useTeam";
import { useCan } from "@/hooks/Authz/useCan";
import AppSwitcher from "@/components/AppSwitcher";
import BillingStatusBanner from "@/components/Billing/BillingStatusBanner";
import Navbar from "@/components/Navbar";
import ProjectSelector from "@/components/Projects/ProjectSelector";
import SideMenu from "@/components/SideMenu";
import type { SideMenuItem } from "@/components/SideMenu/type";
import TeamSwitcher from "@/components/Teams/TeamSwitcher";
import type { DashboardLayoutProps } from "./type";

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const t = useTranslations("sidebar");
  const ta = useTranslations("apps");
  const [menuOpen, setMenuOpen] = useState(false);
  const { lastProjectId } = useTeam();
  const canManageKeys = useCan("apikey.write");
  // Read after mount so server and client render the same markup.
  const [lastApp, setLastAppState] = useState<AppKey | null>(null);

  const pathApp = appOfPath(pathname);

  useEffect(() => {
    setLastAppState(getLastApp());
  }, []);

  useEffect(() => {
    if (!pathApp) return;
    setLastApp(pathApp);
    setLastAppState(pathApp);
  }, [pathApp]);

  // A page both Apps share (Team settings, a Project's API keys) keeps the last App's menu.
  const app: AppKey = pathApp ?? lastApp ?? DEFAULT_APP;

  // Without a remembered Project the Droplets entry has nowhere to lead; pointing it at the
  // project list would light two entries for one page, so it is left out until one is known.
  const dropletItems: SideMenuItem[] = [
    {
      key: "projects",
      label: t("projects"),
      href: DASHBOARD_PATH,
      icon: <AppstoreOutlined />,
      exact: true,
    },
    ...(lastProjectId
      ? [
          {
            key: "droplets",
            label: t("droplets"),
            href: projectPath(lastProjectId),
            icon: <CloudServerOutlined />,
            exact: true,
            matchPrefixes: [`${DROPLETS_PATH}/`, `${projectDropletsPath(lastProjectId)}/`],
          },
        ]
      : []),
    {
      key: "catalog",
      label: t("catalog"),
      href: CATALOG_PATH,
      icon: <ShoppingOutlined />,
    },
  ];

  // Mail lives in a Project; without one known yet only the landing, which finds one, is offered.
  const mailItems: SideMenuItem[] = lastProjectId
    ? [
        {
          key: "mailOverview",
          label: t("mail.overview"),
          href: mailPath(lastProjectId),
          icon: <DashboardOutlined />,
          exact: true,
        },
        {
          key: "mailDomains",
          label: t("mail.domains"),
          href: mailPath(lastProjectId, "domains"),
          icon: <GlobalOutlined />,
        },
        {
          key: "mailLogs",
          label: t("mail.logs"),
          href: mailPath(lastProjectId, "logs"),
          icon: <FileSearchOutlined />,
        },
        {
          key: "mailSuppressions",
          label: t("mail.suppressions"),
          href: mailPath(lastProjectId, "suppressions"),
          icon: <StopOutlined />,
        },
        {
          key: "mailWebhooks",
          label: t("mail.webhooks"),
          href: mailPath(lastProjectId, "webhooks"),
          icon: <ApiOutlined />,
        },
        ...(canManageKeys
          ? [
              {
                key: "apiKeys",
                label: t("mail.apiKeys"),
                href: projectApiKeysPath(lastProjectId),
                icon: <KeyOutlined />,
              },
            ]
          : []),
      ]
    : [
        {
          key: "mailOverview",
          label: t("mail.overview"),
          href: MAIL_LANDING_PATH,
          icon: <DashboardOutlined />,
          exact: true,
        },
      ];

  const menus: Record<AppKey, SideMenuItem[]> = { droplets: dropletItems, mail: mailItems };

  return (
    <div className="flex min-h-screen flex-col bg-surface-muted">
      <header className="sticky top-0 z-20">
        <Navbar app={app} onToggleMenu={() => setMenuOpen((open) => !open)} />
      </header>
      <div className="flex flex-1">
        <aside
          className={classNames(
            "w-60 shrink-0 border-r border-border bg-surface p-4",
            menuOpen ? "block" : "hidden lg:block"
          )}
        >
          <div className="mb-4 flex flex-col gap-2 xl:hidden">
            <AppSwitcher app={app} className="w-full sm:hidden" />
            <TeamSwitcher className="w-full max-w-none" />
            <ProjectSelector app={app} className="w-full max-w-none" />
          </div>
          <SideMenu items={menus[app]} path={pathname} title={ta(`${app}.name`)} />
        </aside>
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-page">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-section">
            <BillingStatusBanner app={app} />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
