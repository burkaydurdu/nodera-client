import type { InboxChange, Notification } from "@/core/notification";

export type InboxListener = (change: InboxChange) => void;

export interface InboxContextValues {
  /** Unread Notifications of the user across every Team; 0 until loaded and when signed out. */
  unreadCount: number;
  /** Marks one read here at once and on the server; an already-read one is left alone. */
  markRead: (notification: Notification) => void;
  /** Marks every Notification read; rejects with the API error so the caller can say so. */
  markAllRead: () => Promise<void>;
  /** What clicking a Notification does anywhere: mark it read, select its Team, open its page. */
  open: (notification: Notification) => void;
  /** Live changes for a list on screen; the returned function stops them. */
  subscribe: (listener: InboxListener) => () => void;
}
