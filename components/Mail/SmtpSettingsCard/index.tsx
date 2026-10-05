"use client";

import { useTranslations } from "next-intl";
import { SMTP_HOST, SMTP_PORTS, SMTP_USERNAME } from "@/core/mail";
import Card from "@/components/Card";
import NoderaCopyButton from "@/components/NoderaCopyButton";
import NoderaLink from "@/components/NoderaLink";
import type { SmtpSettingsCardProps } from "./type";

/** What a ready-made application (WordPress, Laravel, Django) needs to send through Mail. */
export default function SmtpSettingsCard({ apiKeysPath }: SmtpSettingsCardProps) {
  const t = useTranslations("mail.smtp");

  return (
    <Card title={t("title")} description={t("description")}>
      <dl className="flex flex-col gap-4 text-sm">
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs text-text-muted">{t("host")}</dt>
          <dd className="flex min-w-0 items-center gap-1">
            {SMTP_HOST ? (
              <>
                <span className="truncate font-mono text-text">{SMTP_HOST}</span>
                <NoderaCopyButton value={SMTP_HOST} />
              </>
            ) : (
              <span className="text-text-muted">{t("hostUnknown")}</span>
            )}
          </dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs text-text-muted">{t("ports")}</dt>
          <dd className="flex flex-wrap gap-x-4 gap-y-1">
            {SMTP_PORTS.map((entry) => (
              <span key={entry.port} className="flex items-baseline gap-1.5">
                <span className="font-mono text-text">{entry.port}</span>
                <span className="text-xs text-text-muted">
                  {t(`security.${entry.security}`)}
                </span>
              </span>
            ))}
          </dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs text-text-muted">{t("username")}</dt>
          <dd className="flex items-center gap-1">
            <span className="font-mono text-text">{SMTP_USERNAME}</span>
            <NoderaCopyButton value={SMTP_USERNAME} />
          </dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs text-text-muted">{t("password")}</dt>
          <dd className="text-text">
            {t("passwordValue")}{" "}
            {apiKeysPath ? (
              <NoderaLink href={apiKeysPath}>{t("manageKeys")}</NoderaLink>
            ) : (
              <span className="text-text-muted">{t("askForKey")}</span>
            )}
          </dd>
        </div>
      </dl>
      <p className="mt-4 text-xs leading-4 text-text-muted">{t("tls")}</p>
    </Card>
  );
}
