export function formatDateTime(value: string | null | undefined, locale: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(
    date
  );
}

export function formatDate(value: string | null | undefined, locale: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date);
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * A billing date as the service means it: Periods are UTC calendar months, so a date is
 * formatted in UTC and never shifts a day with the viewer's time zone.
 */
export function formatUtcDate(value: string | null | undefined, locale: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(
    date
  );
}

/** A Period's end is exclusive (the first instant of the next month); the last day is one before. */
export function formatPeriodEnd(value: string | null | undefined, locale: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return formatUtcDate(new Date(date.getTime() - DAY_MS).toISOString(), locale);
}

/** A Mail Period sent as `YYYY-MM`, named as its month ("October 2026" / "Ekim 2026"). */
export function formatMonth(period: string | null | undefined, locale: string): string {
  if (!period) return "";
  const match = /^(\d{4})-(\d{2})$/.exec(period);
  if (!match) return period;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1));
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
