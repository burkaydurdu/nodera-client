"use client";

import { CheckCircleFilled, MinusCircleOutlined } from "@ant-design/icons";
import classNames from "classnames";
import { useTranslations } from "next-intl";
import {
  checkPassword,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_RULES,
} from "@/core/password";
import type { PasswordChecklistProps } from "./type";

/** Live list of password rules; each row turns green as the rule is met. */
export default function PasswordChecklist({ password, className }: PasswordChecklistProps) {
  const t = useTranslations("validation.password");
  const checks = checkPassword(password);

  return (
    <ul className={classNames("flex flex-col gap-1", className)} aria-live="polite">
      {PASSWORD_RULES.map((rule) => {
        const met = checks[rule];
        return (
          <li
            key={rule}
            className={classNames(
              "flex items-center gap-2 text-xs leading-4",
              met ? "text-success" : "text-text-muted"
            )}
          >
            {met ? <CheckCircleFilled /> : <MinusCircleOutlined />}
            <span>{t(rule, { min: PASSWORD_MIN_LENGTH, max: PASSWORD_MAX_LENGTH })}</span>
          </li>
        );
      })}
    </ul>
  );
}
