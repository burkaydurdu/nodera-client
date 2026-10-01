import type { KeyboardEvent } from "react";
import classNames from "classnames";
import type { CardProps } from "./type";

export default function Card({
  children,
  title,
  description,
  extra,
  flush = false,
  className,
  onClick,
  pressed,
}: CardProps) {
  const hasHeader = !!title || !!extra;
  const interactive = !!onClick;

  // A div only reacts to the mouse; the button semantics make it reachable by Tab and
  // operable with the keys a real button answers to.
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick || event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      onClick={onClick}
      onKeyDown={interactive ? handleKeyDown : undefined}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-pressed={interactive && pressed !== undefined ? pressed : undefined}
      className={classNames(
        "flex flex-col rounded-card border border-border bg-surface shadow-card",
        interactive &&
          "cursor-pointer transition-colors hover:border-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300",
        className
      )}
    >
      {hasHeader && (
        <div
          className={classNames(
            "flex items-start justify-between gap-4 px-6 pt-6",
            flush ? "pb-4" : "pb-0"
          )}
        >
          <div className="flex flex-col gap-1">
            {title && <h2 className="text-base font-semibold leading-6 text-text">{title}</h2>}
            {description && <p className="text-sm leading-5 text-text-muted">{description}</p>}
          </div>
          {extra && <div className="shrink-0">{extra}</div>}
        </div>
      )}
      <div className={classNames(flush ? "" : "p-6", hasHeader && !flush && "pt-5")}>
        {children}
      </div>
    </div>
  );
}
