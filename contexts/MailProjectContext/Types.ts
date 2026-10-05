import type { Project } from "@/core/project";

export interface MailProjectContextValues {
  /** The Project the Mail App shows, confirmed to belong to the selected Team. */
  project: Project;
}
