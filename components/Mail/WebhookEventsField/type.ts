import type { ReactNode } from "react";
import type { MessageEventType } from "@/core/mail";

export interface WebhookEventsFieldProps {
  /** The Message events the Webhook receives. */
  value: MessageEventType[];
  onChange: (value: MessageEventType[]) => void;
  error?: ReactNode;
  disabled?: boolean;
}
