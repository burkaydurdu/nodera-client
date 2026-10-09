import type { Project } from "@/core/project";

export interface StorageProjectContextValues {
  /** The Project the Storage App shows, confirmed to belong to the selected Team. */
  project: Project;
}
