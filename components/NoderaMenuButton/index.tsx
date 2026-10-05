"use client";

import { Dropdown } from "antd";
import { DownOutlined } from "@ant-design/icons";
import classNames from "classnames";
import type { NoderaMenuButtonProps } from "./type";

/** A top-bar button that opens a menu, as the Team, Project and App switchers are. */
export default function NoderaMenuButton({
  icon,
  label,
  ariaLabel,
  menu,
  placement = "bottomLeft",
  disabled = false,
  className,
}: NoderaMenuButtonProps) {
  return (
    <Dropdown menu={menu} trigger={["click"]} placement={placement} disabled={disabled}>
      <button
        type="button"
        aria-label={ariaLabel}
        disabled={disabled}
        className={classNames(
          "flex h-10 items-center gap-2 rounded-button border border-border bg-surface px-3 text-sm font-medium text-text hover:border-brand-300 hover:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-60",
          className
        )}
      >
        <span className="flex text-text-muted">{icon}</span>
        <span className="truncate">{label}</span>
        <DownOutlined className="text-xs text-text-muted" />
      </button>
    </Dropdown>
  );
}
