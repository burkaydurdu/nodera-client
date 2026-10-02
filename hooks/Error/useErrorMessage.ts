import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { FALLBACK_ERROR_KEY, type ValidationError } from "@/core/error";
import {
  GetErrorMessageKey,
  GetRetryAfterSeconds,
  GetValidationTag,
  IsNetworkError,
} from "@/utils/error";

const FALLBACK_FIELD_ERROR_KEY = "validation.tags.invalid";

/**
 * Turns an API error into a user-visible message: `errors.<domain>-<code>` when translated,
 * a network message when the request never reached the gateway, `errors.wrong` otherwise.
 */
export const useErrorMessage = () => {
  const t = useTranslations();

  const getErrorMessage = useCallback(
    (error: unknown): string => {
      if (IsNetworkError(error)) {
        return t("errors.network");
      }

      const retryAfter = GetRetryAfterSeconds(error);
      const key = GetErrorMessageKey(error);

      if (t.has(key)) {
        return retryAfter != null
          ? `${t(key)} ${t("errors.retryIn", { seconds: retryAfter })}`
          : t(key);
      }

      if (retryAfter != null) {
        return t("errors.rateLimited", { seconds: retryAfter });
      }

      return t(FALLBACK_ERROR_KEY);
    },
    [t]
  );

  /**
   * A 400 field error in the user's language: `validation.tags.<tag>` for the validator tag
   * the service names in its English message, a generic "check this field" otherwise. The
   * service's text itself is never shown.
   */
  const getFieldErrorMessage = useCallback(
    (fieldError: ValidationError): string => {
      const tag = GetValidationTag(fieldError);
      const key = tag ? `validation.tags.${tag}` : FALLBACK_FIELD_ERROR_KEY;
      return t.has(key) ? t(key) : t(FALLBACK_FIELD_ERROR_KEY);
    },
    [t]
  );

  return { getErrorMessage, getFieldErrorMessage };
};
