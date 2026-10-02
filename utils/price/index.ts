/**
 * Money arrives as a decimal string already rounded by the service (4 decimals hourly,
 * 2 monthly); it is shown verbatim so the customer sees exactly what will be locked.
 */
export function formatUsd(value: string | null | undefined): string {
  if (!value) return "";
  return `$${value}`;
}

/** Compares two decimal strings numerically ("0.4920" equals "0.492"). */
export function samePrice(
  a: string | null | undefined,
  b: string | null | undefined
): boolean {
  if (a == null || b == null) return a === b;
  const left = Number.parseFloat(a);
  const right = Number.parseFloat(b);
  if (Number.isNaN(left) || Number.isNaN(right)) return a === b;
  return Math.abs(left - right) < 1e-9;
}

/**
 * Billing amounts arrive as decimal strings already rounded by the billing service; they are
 * shown verbatim with the currency code so nothing is re-rounded on the client.
 */
export function formatMoney(
  value: string | null | undefined,
  currency: string | null | undefined
): string {
  if (!value) return "";
  return currency ? `${value} ${currency}` : value;
}

/** A tax rate stored in basis points, shown as a percentage ("2000" → "20%"). */
export function formatRateBps(rateBps: number): string {
  const percent = rateBps / 100;
  return `${Number.isInteger(percent) ? percent : percent.toFixed(2)}%`;
}
