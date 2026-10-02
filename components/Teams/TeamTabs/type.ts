export type TeamTabKey = "members" | "invitations" | "sshKeys" | "billing";

export interface TeamTabsProps {
  active: TeamTabKey;
  /** Owner-only tab (`team.manage`); SSH keys are readable by every member and always shown. */
  showInvitations: boolean;
  /** Owners and finance (`billing.read`); developers never see the Billing tab. */
  showBilling: boolean;
  onChange: (key: TeamTabKey) => void;
}
