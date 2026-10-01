import type { Image } from "@/core/catalog";

export interface ImagePickerProps {
  /** Images the selected Plan can be installed with. */
  images: Image[];
  value: string | null;
  onChange: (code: string) => void;
  disabled?: boolean;
}
