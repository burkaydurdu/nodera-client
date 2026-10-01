import type { Plan, Region } from "@/core/catalog";

/** Shared by the catalog feature components. */
export interface RegionSelectHandler {
  (region: Region): void;
}

export interface PlanSelectHandler {
  (plan: Plan): void;
}
