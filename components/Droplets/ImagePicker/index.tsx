"use client";

import { CheckCircleFilled } from "@ant-design/icons";
import classNames from "classnames";
import { useTranslations } from "next-intl";
import type { ImagePickerProps } from "./type";

export default function ImagePicker({
  images,
  value,
  onChange,
  disabled = false,
}: ImagePickerProps) {
  const t = useTranslations("droplets.create");

  if (images.length === 0) {
    return <p className="text-sm text-text-muted">{t("noImages")}</p>;
  }

  return (
    <div role="radiogroup" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {images.map((image) => {
        const selected = image.code === value;
        return (
          <button
            key={image.id}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(image.code)}
            className={classNames(
              "flex items-start justify-between gap-3 rounded-input border bg-surface p-4 text-left transition-colors",
              selected
                ? "border-brand-400 ring-2 ring-brand-100"
                : "border-border hover:border-brand-300",
              disabled && "cursor-not-allowed opacity-60"
            )}
          >
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate text-sm font-semibold text-text">{image.name}</span>
              <span className="text-xs text-text-muted">
                {t("imageMeta", { family: image.family, version: image.version })}
              </span>
            </span>
            {selected && <CheckCircleFilled className="shrink-0 text-brand-600" />}
          </button>
        );
      })}
    </div>
  );
}
