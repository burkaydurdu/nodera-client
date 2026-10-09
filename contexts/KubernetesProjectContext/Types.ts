import type { Project } from "@/core/project";

export interface KubernetesProjectContextValues {
  /** The Project the Kubernetes App shows, confirmed to belong to the selected Team. */
  project: Project;
}
