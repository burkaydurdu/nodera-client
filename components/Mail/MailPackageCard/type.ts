import type { MailOverview, MailPackage, PackageBlock } from "@/core/mail";

export interface MailPackageCardProps {
  overview: MailOverview;
  /** The catalog, to word a scheduled Package's allowance. */
  packages: MailPackage[];
  /** `mail.write`: the undo of a scheduled change. */
  canWrite: boolean;
  /** Undoing is a choice of Package like any but a cancellation: it waits for these too. */
  blocked: PackageBlock | null;
  /** A Package change is in flight. */
  busy: boolean;
  /** Chooses the current Package again, which undoes the scheduled change. */
  onUndo: () => void;
}
