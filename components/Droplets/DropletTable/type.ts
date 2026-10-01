import type { Droplet } from "@/core/droplet";
import type { DropletHandler } from "../type";

export interface DropletTableProps {
  droplets: Droplet[];
  loading?: boolean;
  onOpen: DropletHandler;
}
