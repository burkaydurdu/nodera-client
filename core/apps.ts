import { CATALOG_PATH } from "./catalog";
import { DROPLETS_PATH, projectDropletsPath } from "./droplet";
import { MAIL_LANDING_PATH, MAIL_SECTIONS, mailPath } from "./mail";
import {
  NEW_PROJECT_PATH,
  PROJECTS_PATH,
  projectApiKeysPath,
  projectPath,
  projectSettingsPath,
} from "./project";
import { DASHBOARD_PATH } from "./routes";
import { KUBERNETES_LANDING_PATH, clustersPath } from "./kubernetesApp";
import { STORAGE_LANDING_PATH, storagesPath } from "./storageApp";

/**
 * An App is one product's own area of the web app, with its own side menu. Nodera keeps no
 * record of it: the path says which one a page belongs to, and the last one is remembered.
 */
export const APPS = ["droplets", "mail", "storage", "kubernetes"] as const;
export type AppKey = (typeof APPS)[number];

export const DEFAULT_APP: AppKey = "droplets";

export const isAppKey = (value: string | null | undefined): value is AppKey =>
  !!value && (APPS as readonly string[]).includes(value);

const isUnder = (pathname: string, base: string): boolean =>
  pathname === base || pathname.startsWith(`${base}/`);

/** The Project a page is about, read from its path; null for a page about no Project. */
function projectOfPath(pathname: string): string | null {
  if (!isUnder(pathname, PROJECTS_PATH) || isUnder(pathname, NEW_PROJECT_PATH)) return null;
  return pathname.slice(PROJECTS_PATH.length + 1).split("/")[0] || null;
}

interface AppRoutes {
  /** Where the App opens without a Project in mind; Mail's landing picks the remembered one. */
  landing: string;
  /** A Project's own page in the App. */
  home: (projectId: string) => string;
  /** The App's own pages; a page no App claims is shared and keeps the last App's menu. */
  owns: (pathname: string) => boolean;
}

const APP_ROUTES: Record<AppKey, AppRoutes> = {
  droplets: {
    landing: DASHBOARD_PATH,
    home: projectPath,
    owns: (pathname) => {
      const projectId = projectOfPath(pathname);
      if (projectId) {
        return (
          pathname === projectPath(projectId) ||
          isUnder(pathname, projectDropletsPath(projectId))
        );
      }
      return (
        pathname === DASHBOARD_PATH ||
        [CATALOG_PATH, DROPLETS_PATH, NEW_PROJECT_PATH].some((base) => isUnder(pathname, base))
      );
    },
  },
  mail: {
    landing: MAIL_LANDING_PATH,
    home: (projectId) => mailPath(projectId),
    owns: (pathname) => {
      const projectId = projectOfPath(pathname);
      return isUnder(pathname, projectId ? mailPath(projectId) : MAIL_LANDING_PATH);
    },
  },
  storage: {
    landing: STORAGE_LANDING_PATH,
    home: (projectId) => storagesPath(projectId),
    owns: (pathname) => {
      const projectId = projectOfPath(pathname);
      return isUnder(pathname, projectId ? storagesPath(projectId) : STORAGE_LANDING_PATH);
    },
  },
  kubernetes: {
    landing: KUBERNETES_LANDING_PATH,
    home: (projectId) => clustersPath(projectId),
    owns: (pathname) => {
      const projectId = projectOfPath(pathname);
      return isUnder(pathname, projectId ? clustersPath(projectId) : KUBERNETES_LANDING_PATH);
    },
  },
};

/**
 * The App a page belongs to; null for the pages the Apps share (Team settings, Billing,
 * Profile, Notifications, a Project's settings and API keys), which keep the last App's menu.
 */
export const appOfPath = (pathname: string): AppKey | null =>
  APPS.find((app) => APP_ROUTES[app].owns(pathname)) ?? null;

export const appLandingPath = (app: AppKey): string => APP_ROUTES[app].landing;

/** Where switching to an App leads: the same Project in the other product. */
export const appHomePath = (app: AppKey, projectId: string | null): string =>
  projectId ? APP_ROUTES[app].home(projectId) : APP_ROUTES[app].landing;

/** The sections of a Project a switch keeps the user in, the deepest first. */
const PROJECT_SECTIONS: ReadonlyArray<(projectId: string) => string> = [
  ...MAIL_SECTIONS.map((section) => (projectId: string) => mailPath(projectId, section)),
  (projectId) => mailPath(projectId),
  (projectId) => storagesPath(projectId),
  (projectId) => clustersPath(projectId),
  projectApiKeysPath,
  projectSettingsPath,
];

/**
 * The page a Project switch leads to: the same section of the other Project. A detail (a
 * Sending domain, a Droplet, a Storage) belongs to the old Project, so its section's list is
 * opened;
 * null when the page is not about a Project and only the remembered one changes.
 */
export function switchProjectPath(pathname: string, projectId: string): string | null {
  const current = projectOfPath(pathname);
  if (current) {
    const section = PROJECT_SECTIONS.find((path) => isUnder(pathname, path(current)));
    return section ? section(projectId) : projectPath(projectId);
  }
  if (isUnder(pathname, DROPLETS_PATH)) return projectPath(projectId);
  if (pathname === MAIL_LANDING_PATH) return mailPath(projectId);
  if (pathname === STORAGE_LANDING_PATH) return storagesPath(projectId);
  if (pathname === KUBERNETES_LANDING_PATH) return clustersPath(projectId);
  return null;
}
