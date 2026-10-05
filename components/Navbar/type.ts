import type { AppKey } from "@/core/apps";

export interface NavbarProps {
  /** The App on screen: the switcher marks it and the logo leads to its landing. */
  app: AppKey;
  /** Toggles the side menu on small screens. */
  onToggleMenu?: () => void;
}
