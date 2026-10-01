import type { Project } from "@/core/project";

export interface ProjectListProps {
  projects: Project[];
  activeProjectId: string | null;
  onSelect: (project: Project) => void;
}
