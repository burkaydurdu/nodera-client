import { Fragment } from "react";
import NoderaLink from "@/components/NoderaLink";
import type { PageHeaderProps } from "./type";

export default function PageHeader({
  title,
  description,
  breadcrumb,
  extra,
}: PageHeaderProps) {
  return (
    <header className="flex min-h-14 w-full items-start justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-1">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-text-muted">
            {breadcrumb.map((item, index) => (
              <Fragment key={`${item.label}-${index}`}>
                {index > 0 && <span aria-hidden>/</span>}
                {item.href ? (
                  <NoderaLink href={item.href} muted>
                    {item.label}
                  </NoderaLink>
                ) : (
                  <span>{item.label}</span>
                )}
              </Fragment>
            ))}
          </nav>
        )}
        <h1 className="truncate text-2xl font-semibold leading-8 tracking-tight text-text">
          {title}
        </h1>
        {description && <p className="text-sm leading-5 text-text-muted">{description}</p>}
      </div>
      {extra && <div className="flex shrink-0 items-center gap-3">{extra}</div>}
    </header>
  );
}
