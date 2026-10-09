"use client";

import { useTranslations } from "next-intl";
import { validateKubernetesName } from "@/core/kubernetesApp";
import NoderaTextField from "@/components/NoderaTextField";
import type { KubernetesNameFieldProps } from "./type";

/**
 * A Cluster's or a Node pool's name, checked live against the service's rule (an RFC 1123
 * label) so the request is never refused for its shape. A pool's name becomes part of its
 * Nodes' hostnames, which is why both are kept lower-case.
 */
export default function KubernetesNameField({
  label,
  placeholder,
  hint,
  value,
  onChange,
  maxLength,
  serverError = null,
  disabled = false,
  touched = false,
  autoFocus = false,
  onEnter,
}: KubernetesNameFieldProps) {
  const t = useTranslations("kubernetes.name");
  const issue = validateKubernetesName(value, maxLength);
  const started = touched || value.length > 0;

  return (
    <NoderaTextField
      label={label}
      value={value}
      onChange={(next) => onChange(next.toLowerCase().replace(/\s/g, ""))}
      placeholder={placeholder}
      hint={hint ?? t("hint", { max: maxLength })}
      error={
        serverError ?? (started && issue ? t(`issues.${issue}`, { max: maxLength }) : null)
      }
      maxLength={maxLength + 1}
      autoComplete="off"
      autoCapitalize="none"
      autoCorrect="off"
      spellCheck={false}
      autoFocus={autoFocus}
      disabled={disabled}
      onEnter={onEnter}
      className="font-mono"
      required
    />
  );
}
