import ProjectCard from "@/components/Projects/ProjectCard";
import type { ProjectListProps } from "./type";

export default function ProjectList({
  projects,
  activeProjectId,
  onSelect,
}: ProjectListProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          active={project.id === activeProjectId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
