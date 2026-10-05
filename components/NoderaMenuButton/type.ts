import type { ReactNode } from "react";
import type { DropdownProps, MenuProps } from "antd";

export interface NoderaMenuButtonProps {
  /** What the menu chooses, shown ahead of the label. */
  icon: ReactNode;
  /** The current choice; cut short when the button runs out of room. */
  label: ReactNode;
  /** Accessible name; the label alone is only the current choice. */
  ariaLabel: string;
  menu: MenuProps;
  placement?: DropdownProps["placement"];
  disabled?: boolean;
  className?: string;
}
