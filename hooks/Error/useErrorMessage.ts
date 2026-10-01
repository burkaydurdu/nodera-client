import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { FALLBACK_ERROR_KEY } from "@/core/error";
import { GetErrorMessageKey, GetRetryAfterSeconds, IsNetworkError } from "@/utils/error";

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

  return { getErrorMessage };
};
