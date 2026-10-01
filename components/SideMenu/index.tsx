"use client";

import Link from "next/link";
import classNames from "classnames";
import type { SideMenuProps } from "./type";

export default function SideMenu({ items, path }: SideMenuProps) {
  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const active = item.exact
          ? path === item.href
          : path.startsWith(item.href) ||
            (item.matchPrefixes ?? []).some((prefix) => path.startsWith(prefix));
        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={classNames(
              "flex h-11 items-center gap-3 rounded-button px-3 text-sm font-medium transition-colors",
              active
                ? "bg-brand-50 text-brand-700"
                : "text-text-muted hover:bg-surface-raised hover:text-text"
            )}
          >
            {item.icon && <span className="flex text-base">{item.icon}</span>}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
