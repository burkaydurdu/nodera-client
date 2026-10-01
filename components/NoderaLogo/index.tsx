import classNames from "classnames";
import type { NoderaLogoProps } from "./type";

export default function NoderaLogo({
  size = 28,
  markOnly = false,
  className,
}: NoderaLogoProps) {
  return (
    <span
      className={classNames("inline-flex items-center gap-2 select-none", className)}
      style={{ height: size }}
      aria-label="Nodera"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <rect width="32" height="32" rx="9" className="fill-brand-600" />
        <path
          d="M9 22V10h2.4l7.2 8.1V10H21v12h-2.4l-7.2-8.1V22H9z"
          className="fill-text-inverse"
        />
      </svg>
      {!markOnly && (
        <span
          className="font-semibold tracking-tight text-text"
          style={{ fontSize: Math.round(size * 0.72), lineHeight: 1 }}
        >
          Nodera
        </span>
      )}
    </span>
  );
}
