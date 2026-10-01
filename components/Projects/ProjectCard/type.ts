import type { Project } from "@/core/project";

export interface ProjectCardProps {
  project: Project;
  /** The last-used project is highlighted. */
  active?: boolean;
  onSelect?: (project: Project) => void;
}
