"use client";

import { useTranslations } from "next-intl";
import { HOSTNAME_MAX_LENGTH, type HostnameIssue, validateHostname } from "@/core/droplet";
import NoderaTextField from "@/components/NoderaTextField";
import type { HostnameFieldProps } from "./type";

const issueKeys: Record<HostnameIssue, string> = {
  required: "hostnameRequired",
  tooLong: "hostnameTooLong",
  charset: "hostnameCharset",
  hyphenEdge: "hostnameHyphen",
};

/** Hostname input validated live against the RFC 1123 label rules. */
export default function HostnameField({
  value,
  onChange,
  disabled = false,
  touched = false,
}: HostnameFieldProps) {
  const t = useTranslations("droplets.create");
  const issue = validateHostname(value);
  const showIssue = issue && (touched || value.length > 0);

  return (
    <NoderaTextField
      label={t("hostname")}
      value={value}
      onChange={(next) => onChange(next.toLowerCase())}
      placeholder={t("hostnamePlaceholder")}
      hint={t("hostnameHint", { max: HOSTNAME_MAX_LENGTH })}
      error={showIssue ? t(issueKeys[issue], { max: HOSTNAME_MAX_LENGTH }) : null}
      maxLength={HOSTNAME_MAX_LENGTH + 1}
      autoComplete="off"
      spellCheck={false}
      disabled={disabled}
      className="font-mono"
      required
    />
  );
}
