/** A whole number with the locale's grouping ("10,000" / "10.000"); empty for no value. */
export function formatCount(
  value: number | string | null | undefined,
  locale: string
): string {
  if (value === null || value === undefined || value === "") return "";
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) return String(value);
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(number);
}

/**
 * A rate the service sends as a percentage string with two decimals ("2.40" is 2.40%), in the
 * locale's own percent notation ("2.40%" / "%2,40"). The two decimals are kept, never rounded.
 */
export function formatPercentString(value: string | null | undefined, locale: string): string {
  if (!value) return "";
  const number = Number.parseFloat(value);
  if (Number.isNaN(number)) return value;
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number / 100);
}

/** A size in bytes in the largest unit that keeps it above one ("12.4 KB"). */
export function formatBytes(value: number | null | undefined, locale: string): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "";
  const units = ["byte", "kilobyte", "megabyte"] as const;
  let size = value;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return new Intl.NumberFormat(locale, {
    style: "unit",
    unit: units[unit],
    unitDisplay: "short",
    maximumFractionDigits: unit === 0 ? 0 : 1,
  }).format(size);
}

/**
 * A Storage size the way its Package is sold: decimal units, 1 GB = 1,000,000,000 bytes, so a
 * `10gb` Package reads as "10 GB" and not "9.31 GB". Up to terabytes; one decimal above bytes
 * unless the number is whole.
 */
export function formatStorageSize(value: number | null | undefined, locale: string): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "";
  const units = ["byte", "kilobyte", "megabyte", "gigabyte", "terabyte"] as const;
  let size = value;
  let unit = 0;
  while (size >= 1000 && unit < units.length - 1) {
    size /= 1000;
    unit += 1;
  }
  return new Intl.NumberFormat(locale, {
    style: "unit",
    unit: units[unit],
    unitDisplay: "short",
    maximumFractionDigits: unit === 0 ? 0 : 1,
  }).format(size);
}

/** A threshold the web app knows as a number of percent (2 → "2%", 0.05 → "0.05%"). */
export function formatPercentNumber(percent: number, locale: string): string {
  return new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 2 }).format(
    percent / 100
  );
}
