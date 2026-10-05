"use client";

import { useTranslations } from "next-intl";
import { sendCurl } from "@/core/mail";
import NoderaCopyButton from "@/components/NoderaCopyButton";
import type { SendExampleProps } from "./type";

/** A curl that sends one Message with a Project API key, ready to paste into a terminal. */
export default function SendExample({ apiKey, from, to }: SendExampleProps) {
  const t = useTranslations("mail.api.example");
  const command = sendCurl({ apiKey, from, to, subject: t("subject"), text: t("text") });

  return (
    <div className="relative rounded-input border border-border bg-surface-raised">
      <pre className="overflow-x-auto py-2.5 pl-3 pr-11 font-mono text-xs leading-5 text-text">
        <code>{command}</code>
      </pre>
      <NoderaCopyButton
        value={command}
        label={t("copy")}
        className="absolute right-1.5 top-1.5"
      />
    </div>
  );
}
