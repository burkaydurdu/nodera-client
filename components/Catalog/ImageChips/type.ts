import type { Image } from "@/core/catalog";

export interface ImageChipsProps {
  /** Image codes offered by a Plan. */
  codes: string[];
  /** The full Image list, to show names instead of codes. */
  images: Image[];
}
