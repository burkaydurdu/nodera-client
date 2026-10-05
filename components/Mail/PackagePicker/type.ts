import type { MailOverview, MailPackage, PackageAction, PackageBlock } from "@/core/mail";

export interface PackagePickerProps {
  packages: MailPackage[];
  overview: MailOverview;
  /** `mail.write`; without it the catalog is shown read-only. */
  canWrite: boolean;
  /** Every choice but cancelling Mail waits for a card or a paid invoice. */
  blocked: PackageBlock | null;
  /** The code whose change is in flight (`none` for a cancellation). */
  busyCode: string | null;
  onSelect: (pkg: MailPackage, action: PackageAction) => void;
  onCancelMail: () => void;
}
