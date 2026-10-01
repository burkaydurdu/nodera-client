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
