"use client";

import { useTranslations } from "next-intl";
import Card from "@/components/Card";
import NoderaCopyButton from "@/components/NoderaCopyButton";
import NoderaLink from "@/components/NoderaLink";
import type { ConnectionDetailsCardProps } from "./type";

/** What any S3 tool asks for: the endpoint, the Region, the Bucket name and where it answers. */
export default function ConnectionDetailsCard({
  storage,
  accessKeysPath,
}: ConnectionDetailsCardProps) {
  const t = useTranslations("storage.settings.connection");

  const rows: { key: string; value: string }[] = [
    { key: "endpoint", value: storage.endpoint },
    { key: "region", value: storage.region },
    { key: "bucketName", value: storage.bucketName },
    { key: "url", value: storage.url },
  ];

  return (
    <Card title={t("title")} description={t("description")}>
      <dl className="flex flex-col gap-4 text-sm">
        {rows.map((row) => (
          <div key={row.key} className="flex flex-col gap-0.5">
            <dt className="text-xs text-text-muted">{t(row.key)}</dt>
            <dd className="flex min-w-0 items-center gap-1">
              <span className="truncate font-mono text-text">{row.value}</span>
              <NoderaCopyButton value={row.value} />
            </dd>
          </div>
        ))}
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs text-text-muted">{t("credentials")}</dt>
          <dd className="text-text">
            {t("credentialsValue")}{" "}
            {accessKeysPath && (
              <NoderaLink href={accessKeysPath}>{t("manageKeys")}</NoderaLink>
            )}
          </dd>
        </div>
      </dl>
      <p className="mt-4 text-xs leading-4 text-text-muted">{t("pathStyle")}</p>
    </Card>
  );
}
