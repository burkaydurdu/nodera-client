"use client";

import { Spin } from "antd";
import classNames from "classnames";
import type { LoadingProps } from "./type";

export default function Loading({ fullScreen = false, className }: LoadingProps) {
  return (
    <div
      className={classNames(
        "flex items-center justify-center bg-surface-muted",
        fullScreen ? "fixed inset-0 z-50" : "min-h-[200px] w-full",
        className
      )}
    >
      <Spin size="large" />
    </div>
  );
}
