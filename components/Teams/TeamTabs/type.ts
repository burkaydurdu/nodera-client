export type TeamTabKey = "members" | "invitations" | "sshKeys";

export interface TeamTabsProps {
  active: TeamTabKey;
  /** Owner-only tab (`team.manage`); SSH keys are readable by every member and always shown. */
  showInvitations: boolean;
  onChange: (key: TeamTabKey) => void;
}
