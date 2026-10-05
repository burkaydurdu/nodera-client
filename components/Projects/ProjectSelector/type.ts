import type { AppKey } from "@/core/apps";

export interface ProjectSelectorProps {
  /** The App on screen: a Project created from the selector opens in it. */
  app: AppKey;
  className?: string;
}
