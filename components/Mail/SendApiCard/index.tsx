"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { API_KEY_VARIABLE, INTEGRATION_API_URL, mailPath } from "@/core/mail";
import { useSendExampleAddresses } from "@/hooks/Mail/useSendExampleAddresses";
import Card from "@/components/Card";
import SendExample from "@/components/Mail/SendExample";
import TestMessageWatch from "@/components/Mail/TestMessageWatch";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import NoderaLink from "@/components/NoderaLink";
import type { SendApiCardProps } from "./type";

/**
 * What software needs to send through the HTTP API, beside the SMTP settings. The watch starts
 * on request only: an overview left open must not keep asking for Messages.
 */
export default function SendApiCard({ projectId, apiKeysPath }: SendApiCardProps) {
  const t = useTranslations("mail.api");
  const [watching, setWatching] = useState(false);
  const { from, to, needsDomain } = useSendExampleAddresses(projectId);

  if (!INTEGRATION_API_URL) {
    return (
      <Card title={t("title")} description={t("description")}>
        <p className="text-sm text-text-muted">{t("notConfigured")}</p>
      </Card>
    );
  }

  return (
    <Card
      title={t("title")}
      description={t("description")}
      extra={
        <NoderaButton
          variant={watching ? "text" : "outlined"}
          size="small"
          onClick={() => setWatching((value) => !value)}
        >
          {watching ? t("stopWatching") : t("watch")}
        </NoderaButton>
      }
    >
      <div className="flex flex-col gap-3">
        {needsDomain && (
          <NoderaAlert
            variant="warning"
            message={t("needsDomain")}
            description={
              <NoderaLink href={mailPath(projectId, "domains")}>{t("addDomain")}</NoderaLink>
            }
          />
        )}
        <SendExample apiKey={null} from={from} to={to} />
        <p className="text-xs leading-4 text-text-muted">
          {t("keyHint", { variable: API_KEY_VARIABLE })}{" "}
          {apiKeysPath ? (
            <NoderaLink href={apiKeysPath}>{t("manageKeys")}</NoderaLink>
          ) : (
            t("askForKey")
          )}
        </p>
        {watching && <TestMessageWatch projectId={projectId} />}
      </div>
    </Card>
  );
}
