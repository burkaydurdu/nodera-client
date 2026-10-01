"use client";

import { useEffect, useState } from "react";
import { Tooltip } from "antd";
import { CheckOutlined, CopyOutlined } from "@ant-design/icons";
import classNames from "classnames";
import { useTranslations } from "next-intl";
import type { NoderaCopyButtonProps } from "./type";

const FEEDBACK_MS = 1500;

/** Icon button that copies `value` and confirms inline for a moment. */
export default function NoderaCopyButton({ value, label, className }: NoderaCopyButtonProps) {
  const t = useTranslations("common");
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!copied && !failed) return;
    const timer = setTimeout(() => {
      setCopied(false);
      setFailed(false);
    }, FEEDBACK_MS);
    return () => clearTimeout(timer);
  }, [copied, failed]);

  const handleCopy = async (event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      setFailed(true);
    }
  };

  const title = failed ? t("copyFailed") : copied ? t("copied") : (label ?? t("copy"));

  return (
    <Tooltip title={title} open={copied || failed ? true : undefined}>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={label ?? t("copy")}
        className={classNames(
          "inline-flex size-7 shrink-0 items-center justify-center rounded-button text-text-muted transition-colors hover:bg-surface-raised hover:text-text",
          copied && "text-success",
          failed && "text-danger",
          className
        )}
      >
        {copied ? <CheckOutlined /> : <CopyOutlined />}
      </button>
    </Tooltip>
  );
}
