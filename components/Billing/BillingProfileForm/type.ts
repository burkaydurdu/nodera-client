import type { BillingProfile } from "@/core/billing";
import type { BillingProfileSavedHandler } from "../type";

export interface BillingProfileFormProps {
  teamId: string;
  /** The saved profile, or null when the Team has none yet. */
  profile: BillingProfile | null;
  /** Without `billing.write` the fields are shown read-only and there is no save. */
  canWrite: boolean;
  onSaved: BillingProfileSavedHandler;
}
