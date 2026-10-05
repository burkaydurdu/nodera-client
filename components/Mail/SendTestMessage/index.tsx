"use client";

import { useTranslations } from "next-intl";
import { mailPath } from "@/core/mail";
import { useSendExampleAddresses } from "@/hooks/Mail/useSendExampleAddresses";
import SendExample from "@/components/Mail/SendExample";
import TestMessageWatch from "@/components/Mail/TestMessageWatch";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaLink from "@/components/NoderaLink";
import type { SendTestMessageProps } from "./type";

/**
 * Trying a key the moment it is made: the command with the key written in, and the Message it
 * sends arriving below it, as the setup guides of other email services do.
 */
export default function SendTestMessage({ projectId, apiKey }: SendTestMessageProps) {
  const t = useTranslations("mail.testMessage");
  const { from, to, needsDomain } = useSendExampleAddresses(projectId);

  return (
    <section className="flex flex-col gap-3 border-t border-border pt-4">
      <div className="flex flex-col gap-0.5">
        <h3 className="text-sm font-semibold text-text">{t("title")}</h3>
        <p className="text-xs leading-4 text-text-muted">{t("description")}</p>
      </div>
      {needsDomain && (
        <NoderaAlert
          variant="warning"
          message={t("needsDomain")}
          description={
            <NoderaLink href={mailPath(projectId, "domains")}>{t("addDomain")}</NoderaLink>
          }
        />
      )}
      <SendExample apiKey={apiKey} from={from} to={to} />
      <TestMessageWatch projectId={projectId} />
    </section>
  );
}
