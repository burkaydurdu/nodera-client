import type { Project } from "@/core/project";

/** Shared by the project feature components. */
export interface ProjectCreatedHandler {
  (project: Project): void;
}
