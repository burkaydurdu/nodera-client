import type { ReactNode } from "react";

export interface SideMenuItem {
  key: string;
  label: string;
  href: string;
  icon?: ReactNode;
  /** Match only the exact path instead of the prefix. */
  exact?: boolean;
  /** Extra path prefixes that keep this entry highlighted (e.g. a detail page of the same area). */
  matchPrefixes?: string[];
}

export interface SideMenuProps {
  items: SideMenuItem[];
  path: string;
}
