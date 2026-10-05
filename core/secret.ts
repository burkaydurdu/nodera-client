/**
 * The listed shape of something just created: everything but the secret its creation answer
 * carries this once, so a list never holds it.
 */
export function withoutSecret<T extends object, K extends keyof T>(
  created: T,
  secret: K
): Omit<T, K> {
  const { [secret]: _shownOnce, ...listed } = created;
  return listed;
}
