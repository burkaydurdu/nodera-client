import type { MailPause, MailRates } from "@/core/mail";

export interface MailPauseAlertProps {
  pause: MailPause;
  /** The rates that are read with the reason. */
  rates: MailRates;
}
