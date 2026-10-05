import type { Suppression } from "@/core/mail";

export interface SuppressionTableProps {
  /** The Project whose logs a Suppression's Message is opened in. */
  projectId: string;
  suppressions: Suppression[];
  loading?: boolean;
  /** Id of the Suppression whose removal is in flight. */
  deletingId?: string | null;
  /** Absent without `mail.write`: no removal is offered. */
  onDelete?: (suppression: Suppression) => void;
}
