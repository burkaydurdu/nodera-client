import Link from "next/link";
import classNames from "classnames";
import type { NoderaLinkProps } from "./type";

export default function NoderaLink({
  href,
  children,
  className,
  muted = false,
}: NoderaLinkProps) {
  return (
    <Link
      href={href}
      className={classNames(
        "font-medium transition-colors hover:underline",
        muted ? "text-text-muted hover:text-text" : "text-brand-600 hover:text-brand-700",
        className
      )}
    >
      {children}
    </Link>
  );
}
