import type { AppKey } from "@/core/apps";

export interface AppSwitcherProps {
  /** The App the current page belongs to, or the last one on a page both Apps share. */
  app: AppKey;
  className?: string;
}
