"use client";

import { Fragment } from "react";
import { RightOutlined } from "@ant-design/icons";
import classNames from "classnames";
import { useTranslations } from "next-intl";
import { baseName, prefixCrumbs } from "@/core/storageApp";
import type { FileBreadcrumbsProps } from "./type";

/** The folders on the way to the one on screen, each a step back. */
export default function FileBreadcrumbs({
  bucketName,
  prefix,
  onNavigate,
}: FileBreadcrumbsProps) {
  const t = useTranslations("storage.files");
  const crumbs = prefixCrumbs(prefix);

  return (
    <nav
      aria-label={t("breadcrumbs")}
      className="flex min-w-0 flex-wrap items-center gap-1 text-sm"
    >
      {crumbs.map((crumb, index) => {
        const last = index === crumbs.length - 1;
        const label = crumb === "" ? bucketName : baseName(crumb);
        return (
          <Fragment key={crumb || "root"}>
            {index > 0 && (
              <RightOutlined className="text-[10px] text-text-muted" aria-hidden />
            )}
            <button
              type="button"
              onClick={() => !last && onNavigate(crumb)}
              aria-current={last ? "location" : undefined}
              disabled={last}
              className={classNames(
                "max-w-60 truncate rounded-button px-1.5 py-0.5 font-mono",
                last
                  ? "font-semibold text-text"
                  : "text-brand-600 hover:bg-surface-raised hover:text-brand-700"
              )}
            >
              {label}
            </button>
          </Fragment>
        );
      })}
    </nav>
  );
}
