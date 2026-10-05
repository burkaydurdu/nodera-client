import type { MailOverview } from "@/core/mail";

export interface MailSendingStateAlertProps {
  /** Its `sendingState` is explained; a Pause has its own banner and is left to it. */
  overview: MailOverview;
}
