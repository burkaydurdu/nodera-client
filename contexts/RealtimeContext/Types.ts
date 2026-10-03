import type { RealtimeHandler, RealtimeMessageType } from "@/core/realtime";

export interface RealtimeContextValues {
  /** Adds a handler for one message type; the returned function removes it. */
  subscribe: <T extends RealtimeMessageType>(
    type: T,
    handler: RealtimeHandler<T>
  ) => () => void;
  /**
   * Adds a handler for "refetch what you show": a socket is ready again after a gap, or the
   * tab is visible again. Pushes are nudges, REST stays the source of truth (ADR-0007).
   */
  onResync: (handler: () => void) => () => void;
}
