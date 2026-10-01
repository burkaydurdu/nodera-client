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
