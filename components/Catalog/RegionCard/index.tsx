"use client";

import { EnvironmentOutlined } from "@ant-design/icons";
import classNames from "classnames";
import { useTranslations } from "next-intl";
import Card from "@/components/Card";
import type { RegionCardProps } from "./type";

export default function RegionCard({ region, active = false, onSelect }: RegionCardProps) {
  const t = useTranslations("catalog");

  return (
    <Card
      onClick={onSelect ? () => onSelect(region) : undefined}
      pressed={onSelect ? active : undefined}
      className={classNames("h-full", active && "border-brand-400 ring-2 ring-brand-100")}
    >
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-button bg-brand-50 text-brand-600">
          <EnvironmentOutlined style={{ fontSize: 18 }} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h3 className="truncate text-base font-semibold leading-6 text-text">
            {region.city}
          </h3>
          <p className="text-sm leading-5 text-text-muted">{region.country}</p>
          <p className="pt-1 text-xs text-text-muted">
            {t("planCount", { count: region.planCount })}
          </p>
        </div>
      </div>
    </Card>
  );
}
