import type { Region } from "@/core/catalog";
import type { RegionSelectHandler } from "../type";

export interface RegionListProps {
  regions: Region[];
  selectedCode: string | null;
  onSelect: RegionSelectHandler;
}
