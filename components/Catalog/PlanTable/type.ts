import type { Image, Plan } from "@/core/catalog";
import type { PlanSelectHandler } from "../type";

export interface PlanTableProps {
  plans: Plan[];
  images: Image[];
  loading?: boolean;
  /** When set, rows become selectable (sold-out rows stay disabled). */
  onSelect?: PlanSelectHandler;
  selectedCode?: string | null;
}
