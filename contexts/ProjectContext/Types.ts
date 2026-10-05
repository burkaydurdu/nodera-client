import type { Project } from "@/core/project";

export interface ProjectContextValues {
  /** The selected Team's Projects, newest first; empty until loaded. */
  projects: Project[];
  /** The remembered Project (TeamContext) once it is known to be the Team's; null otherwise. */
  currentProject: Project | null;
  /** The selected Team's first list is on its way. */
  isLoading: boolean;
  /** i18n-resolved message when the selected Team's list could not be loaded at all. */
  error: string | null;
  /** Reads the list afresh; resolves with this answer, rejects with the API error. */
  reload: () => Promise<Project[]>;
  /** Adds a Project just created to the list and remembers it. */
  addProject: (project: Project) => void;
}
