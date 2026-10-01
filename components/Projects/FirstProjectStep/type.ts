import type { ProjectCreatedHandler } from "../type";

export interface FirstProjectStepProps {
  teamId: string;
  onCreated: ProjectCreatedHandler;
}
