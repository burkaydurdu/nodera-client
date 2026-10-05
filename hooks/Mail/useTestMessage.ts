"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GetMessage, ListMessages } from "@/api/mail";
import {
  type MessageDetail,
  type MessageSummary,
  TEST_MESSAGE_FOLLOW_MS,
  TEST_MESSAGE_POLL_MS,
  TEST_MESSAGE_WAIT_MINUTES,
  isRecipientSettled,
} from "@/core/mail";
import { usePolling } from "@/hooks/Polling/usePolling";

export type TestMessagePhase = "waiting" | "received" | "expired";

export interface TestMessageState {
  phase: TestMessagePhase;
  /** The Message that arrived, its recipients as last read; null before one does. */
  message: MessageSummary | null;
  /** Reads kept failing and the panel stopped asking until `retry`. */
  stalled: boolean;
  retry: () => void;
  /** Waits again for a Message newer than the newest one now. */
  restart: () => void;
}

const settled = (message: MessageSummary): boolean =>
  message.recipients.every((recipient) => isRecipientSettled(recipient.status));

const summaryOf = (detail: MessageDetail): MessageSummary => ({
  id: detail.id,
  from: detail.from,
  subject: detail.subject,
  recipients: detail.recipients.map(({ address, status }) => ({ address, status })),
  tags: detail.tags,
  source: detail.source,
  createdAt: detail.createdAt,
});

/**
 * Watches a Project for the next Message it accepts, the one a test command sends, then follows
 * its recipients until each has an outcome. It asks the logs rather than listening on the
 * socket: a push per accepted Message would flood every member's tab of a busy Project, while
 * this asks only while someone waits. The newest Message when it starts is the one to beat, so
 * the service's clock decides what is new, never the browser's.
 */
export const useTestMessage = (projectId: string): TestMessageState => {
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<TestMessagePhase>("waiting");
  const [message, setMessage] = useState<MessageSummary | null>(null);
  // The arrived Message still has a recipient without an outcome, within the follow window.
  const [following, setFollowing] = useState(false);
  // The newest Message's id when the round began, null for none; undefined until read.
  const baseline = useRef<string | null | undefined>(undefined);
  const found = useRef<string | null>(null);
  const deadline = useRef(0);
  const followUntil = useRef(0);
  // Bumped by every start (a restart, another Project): a read answered for an earlier start is
  // dropped rather than taken for this one's.
  const generation = useRef(0);

  const tick = async () => {
    const mine = generation.current;
    if (found.current) {
      const latest = summaryOf((await GetMessage(projectId, found.current)).data);
      if (mine !== generation.current) return;
      setMessage(latest);
      setFollowing(!settled(latest) && Date.now() < followUntil.current);
      return;
    }

    const newest = (await ListMessages(projectId, { limit: 1 })).data.items[0] ?? null;
    if (mine !== generation.current) return;
    if (baseline.current === undefined) {
      baseline.current = newest?.id ?? null;
      return;
    }
    if (newest && newest.id !== baseline.current) {
      found.current = newest.id;
      followUntil.current = Date.now() + TEST_MESSAGE_FOLLOW_MS;
      setMessage(newest);
      setFollowing(!settled(newest));
      setPhase("received");
      return;
    }
    if (Date.now() > deadline.current) setPhase("expired");
  };

  const { stalled, retry, refresh } = usePolling(
    tick,
    TEST_MESSAGE_POLL_MS,
    phase === "waiting" || following
  );

  useEffect(() => {
    generation.current += 1;
    baseline.current = undefined;
    found.current = null;
    deadline.current = Date.now() + TEST_MESSAGE_WAIT_MINUTES * 60 * 1000;
    setPhase("waiting");
    setMessage(null);
    setFollowing(false);
    // The newest Message is read at once: one sent before the first interval must still count.
    refresh();
  }, [projectId, round, refresh]);

  const restart = useCallback(() => setRound((value) => value + 1), []);

  return { phase, message, stalled, retry, restart };
};
