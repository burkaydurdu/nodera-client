import type { InvitationLookup } from "@/core/invitation";

export interface InvitationBannerProps {
  invitation: InvitationLookup;
  /** Shown under the headline, e.g. which address to sign up with. */
  hint?: string;
}
