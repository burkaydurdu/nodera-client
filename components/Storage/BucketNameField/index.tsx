"use client";

import { CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons";
import classNames from "classnames";
import { useTranslations } from "next-intl";
import {
  BUCKET_NAME_MAX_LENGTH,
  BUCKET_NAME_MIN_LENGTH,
  type BucketNameIssue,
  validateBucketName,
} from "@/core/storageApp";
import NoderaTextField from "@/components/NoderaTextField";
import type { BucketNameFieldProps } from "./type";

/** Each rule as the user types; a rule is listed with the issue that breaks it. */
const RULES: { key: string; issues: BucketNameIssue[] }[] = [
  { key: "length", issues: ["required", "tooShort", "tooLong"] },
  { key: "charset", issues: ["charset", "dots"] },
  { key: "edge", issues: ["edge"] },
];

/**
 * The Bucket name, checked live against the service's rules so the request is never refused
 * for its shape. The name becomes part of a hostname, which is why it is kept lower-case.
 */
export default function BucketNameField({
  value,
  onChange,
  serverError = null,
  disabled = false,
  touched = false,
  autoFocus = false,
  onEnter,
}: BucketNameFieldProps) {
  const t = useTranslations("storage.open.bucketName");
  const issue = validateBucketName(value);
  const started = touched || value.length > 0;
  const values = { min: BUCKET_NAME_MIN_LENGTH, max: BUCKET_NAME_MAX_LENGTH };

  return (
    <div className="flex flex-col gap-2">
      <NoderaTextField
        label={t("label")}
        value={value}
        onChange={(next) => onChange(next.toLowerCase().replace(/\s/g, ""))}
        placeholder={t("placeholder")}
        hint={t("hint")}
        error={serverError ?? (started && issue ? t(`issues.${issue}`, values) : null)}
        maxLength={BUCKET_NAME_MAX_LENGTH + 1}
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
      <ul className="flex flex-col gap-1 text-xs leading-4" aria-live="polite">
        {RULES.map((rule) => {
          const broken = issue !== null && rule.issues.includes(issue);
          const met = started && !broken;
          return (
            <li
              key={rule.key}
              className={classNames(
                "flex items-center gap-1.5",
                met ? "text-success" : started && broken ? "text-danger" : "text-text-muted"
              )}
            >
              {met ? (
                <CheckCircleFilled aria-hidden />
              ) : started && broken ? (
                <CloseCircleFilled aria-hidden />
              ) : (
                <span className="inline-block size-1.5 rounded-full bg-current" aria-hidden />
              )}
              {t(`rules.${rule.key}`, values)}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
