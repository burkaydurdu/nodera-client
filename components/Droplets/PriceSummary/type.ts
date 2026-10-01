import type { Image, Plan, Region } from "@/core/catalog";

export interface PriceSummaryProps {
  region: Region | null;
  plan: Plan | null;
  image: Image | null;
  hostname: string;
  keyCount: number;
}
