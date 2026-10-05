import type { AppKey } from "@/core/apps";

export interface BillingStatusBannerProps {
  /** The App on screen: what a missing card or a suspension blocks is told in its terms. */
  app: AppKey;
}
