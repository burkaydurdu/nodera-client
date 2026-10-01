import type { ReactNode } from "react";

export interface CardProps {
  children: ReactNode;
  title?: string;
  description?: string;
  /** Right side of the header. */
  extra?: ReactNode;
  /** Remove the inner padding (e.g. for tables). */
  flush?: boolean;
  className?: string;
  /** Makes the whole card a keyboard-reachable button (role, tabIndex, Enter/Space). */
  onClick?: () => void;
  /** Toggle state announced as `aria-pressed`; only meaningful together with `onClick`. */
  pressed?: boolean;
}
