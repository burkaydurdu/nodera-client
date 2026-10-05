import type { MessageSummary } from "@/core/mail";

export interface MessageTableProps {
  messages: MessageSummary[];
  loading?: boolean;
  onOpen: (message: MessageSummary) => void;
}
