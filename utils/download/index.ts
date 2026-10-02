/** Saves a fetched Blob through a transient anchor; the object URL is released right after. */
export function saveBlob(blob: Blob, filename: string): void {
  if (typeof window === "undefined") return;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Some browsers start reading the object URL only after the click handler returns.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * The file name a `Content-Disposition` header suggests (RFC 6266: `filename*` wins over
 * `filename`), or the fallback when the header is absent, unreadable or not exposed by CORS.
 */
export function filenameFromContentDisposition(
  header: string | null | undefined,
  fallback: string
): string {
  if (!header) return fallback;
  const extended = /filename\*\s*=\s*(?:UTF-8|utf-8)''([^;]+)/.exec(header);
  if (extended) {
    try {
      const decoded = decodeURIComponent(extended[1].trim().replace(/^"|"$/g, ""));
      if (decoded) return decoded;
    } catch {
      // Malformed percent-encoding: fall through to the plain parameter.
    }
  }
  const plain = /filename\s*=\s*("([^"]*)"|[^;]+)/.exec(header);
  const name = (plain?.[2] ?? plain?.[1] ?? "").trim();
  // Only the base name: a header must never steer the save into a directory.
  const base = name.split(/[\\/]/).pop() ?? "";
  return base || fallback;
}
