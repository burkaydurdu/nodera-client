"use client";

import { useTranslations } from "next-intl";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaCopyButton from "@/components/NoderaCopyButton";
import type { DmarcMissingAlertProps } from "./type";

/** The mildest policy that still answers the mailbox providers asking for one. */
const SUGGESTED_DMARC = "v=DMARC1; p=none";

/** No DMARC record answers for the domain: a warning, never a refusal, with a record to add. */
export default function DmarcMissingAlert({ domainName }: DmarcMissingAlertProps) {
  const t = useTranslations("mail.domains.dmarc");
  const host = `_dmarc.${domainName}`;

  return (
    <NoderaAlert
      variant="warning"
      message={t("title")}
      description={
        <div className="flex flex-col gap-2">
          <span>{t("description")}</span>
          <div className="flex flex-col gap-1 text-xs">
            <span className="flex flex-wrap items-center gap-1">
              <span className="text-text-muted">{t("host")}</span>
              <span className="break-all font-mono text-text">{host}</span>
              <NoderaCopyButton value={host} />
            </span>
            <span className="flex flex-wrap items-center gap-1">
              <span className="text-text-muted">{t("value")}</span>
              <span className="font-mono text-text">{SUGGESTED_DMARC}</span>
              <NoderaCopyButton value={SUGGESTED_DMARC} />
            </span>
          </div>
        </div>
      }
    />
  );
}
