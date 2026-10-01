import type { Region } from "@/core/catalog";
import type { RegionSelectHandler } from "../type";

export interface RegionCardProps {
  region: Region;
  active?: boolean;
  onSelect?: RegionSelectHandler;
}
