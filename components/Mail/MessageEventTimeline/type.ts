import type { MessageEvent } from "@/core/mail";

export interface MessageEventTimelineProps {
  /** One recipient's Message events, in any order. */
  events: MessageEvent[];
}
