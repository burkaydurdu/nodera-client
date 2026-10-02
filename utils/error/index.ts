import { AxiosError } from "axios";
import { FALLBACK_ERROR_KEY, type ApiError, type ValidationError } from "@/core/error";

const isApiError = (data: unknown): data is ApiError =>
  typeof data === "object" && data !== null && "code" in data && "domain" in data;

const isValidationErrorList = (data: unknown): data is ValidationError[] =>
  Array.isArray(data) &&
  data.every((item) => typeof item === "object" && item && "field" in item);

/** `${domain}-${code}` of the error envelope, or null when the error carries none. */
export function GetErrorCode(error: unknown): string | null {
  if (error instanceof AxiosError && isApiError(error.response?.data)) {
    return `${error.response!.data.domain}-${error.response!.data.code}`;
  }
  return null;
}

export function IsErrorCode(error: unknown, code: string): boolean {
  return GetErrorCode(error) === code;
}

/** i18n key for an error: `errors.<domain>-<code>`, or the fallback. */
export function GetErrorMessageKey(
  error: unknown,
  fallbackKey: string = FALLBACK_ERROR_KEY
): string {
  const code = GetErrorCode(error);
  return code ? `errors.${code}` : fallbackKey;
}

export function GetStatus(error: unknown): number | null {
  return error instanceof AxiosError ? (error.response?.status ?? null) : null;
}

/** Seconds from the `Retry-After` header of a 429 response. */
export function GetRetryAfterSeconds(error: unknown): number | null {
  if (!(error instanceof AxiosError) || error.response?.status !== 429) return null;
  const raw = error.response.headers?.["retry-after"];
  if (raw == null) return null;
  const seconds = Number.parseInt(String(raw), 10);
  if (!Number.isNaN(seconds)) return Math.max(seconds, 1);
  const date = Date.parse(String(raw));
  if (!Number.isNaN(date)) return Math.max(Math.ceil((date - Date.now()) / 1000), 1);
  return null;
}

export function IsRateLimited(error: unknown): boolean {
  return GetStatus(error) === 429;
}

export function GetValidationErrors(error: unknown): ValidationError[] {
  if (error instanceof AxiosError && error.response?.status === 400) {
    const data = error.response.data;
    if (isValidationErrorList(data)) return data;
  }
  return [];
}

/**
 * The validator tag a field error failed on. The services answer
 * "Validation failed on the '<tag>' tag"; the tag is what the client translates.
 */
export function GetValidationTag(fieldError: ValidationError): string | null {
  const match = /'([^']+)' tag/.exec(fieldError.message ?? "");
  return match ? match[1] : null;
}

/** No answer (network) or a server-side failure: worth retrying the same request. */
export function IsRetryableError(error: unknown): boolean {
  if (IsNetworkError(error)) return true;
  const status = GetStatus(error);
  return status != null && status >= 500;
}

export function IsNetworkError(error: unknown): boolean {
  return error instanceof AxiosError && !error.response;
}
