export interface Project {
  id: string;
  teamId: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface CreateProjectPayload {
  name: string;
  description: string;
}

export const PROJECT_NAME_MAX_LENGTH = 64;
export const PROJECT_DESCRIPTION_MAX_LENGTH = 512;

/**
 * How long a page keeps retrying a service's "project not found" right after the Project was
 * created: Droplets and Mail learn a Project from an event (ADR-0004).
 */
export const PROJECT_ACCESS_RETRY_MS = 5_000;
export const PROJECT_ACCESS_RETRY_INTERVAL_MS = 1_000;

export const PROJECTS_PATH = "/dashboard/projects";

/** The full-page form a Project is created with; its path is no Project's. */
export const NEW_PROJECT_PATH = `${PROJECTS_PATH}/new`;

/** A Project's own page in the Droplets App: its Droplet list. */
export const projectPath = (projectId: string): string => `${PROJECTS_PATH}/${projectId}`;

/** Project settings: its details and, for `apikey.write`, its API keys. */
export const projectSettingsPath = (projectId: string): string =>
  `${projectPath(projectId)}/settings`;

export const projectApiKeysPath = (projectId: string): string =>
  `${projectPath(projectId)}/api-keys`;
