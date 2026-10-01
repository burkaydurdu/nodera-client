import type { Droplet } from "@/core/droplet";

/** Shared by the droplet feature components. */
export interface DropletHandler {
  (droplet: Droplet): void;
}
