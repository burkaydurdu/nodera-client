"use client";

import { KeyOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import Card from "@/components/Card";
import NoderaCopyButton from "@/components/NoderaCopyButton";
import type { DropletSSHKeysProps } from "./type";

/** The keys the Droplet was created with; a Team key deleted later stays listed here. */
export default function DropletSSHKeys({ keys }: DropletSSHKeysProps) {
  const t = useTranslations("droplets.detail");

  return (
    <Card title={t("sshKeysTitle")} description={t("sshKeysDescription")}>
      {keys.length === 0 ? (
        <p className="text-sm text-text-muted">{t("sshKeysEmpty")}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {keys.map((key) => (
            <li
              key={key.fingerprint}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-button bg-brand-50 text-brand-600">
                <KeyOutlined />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium text-text">{key.name}</span>
                <span className="truncate font-mono text-xs text-text-muted">
                  {key.fingerprint}
                </span>
              </span>
              <NoderaCopyButton value={key.fingerprint} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
