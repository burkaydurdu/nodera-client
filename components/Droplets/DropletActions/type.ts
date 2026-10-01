import type { Droplet, DropletActionType } from "@/core/droplet";

export interface DropletActionsProps {
  droplet: Droplet;
  /** True while an action or the delete is in flight; every button is disabled meanwhile. */
  busy: boolean;
  /** Resolves to true when the service accepted the action; false keeps a confirm dialog open. */
  onAction: (type: DropletActionType) => Promise<boolean>;
  onDelete: () => Promise<boolean>;
}
