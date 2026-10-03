"use client";

import { createContext, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { App } from "antd";
import { usePathname } from "next/navigation";
import {
  GetUnreadNotificationCount,
  MarkAllNotificationsRead,
  MarkNotificationRead,
} from "@/api/notifications";
import {
  type InboxChange,
  type Notification,
  createdAtMs,
  notificationKind,
  notificationTeamName,
} from "@/core/notification";
import useAuth from "../AuthContext/useAuth";
import useInvitations from "../InvitationContext/useInvitations";
import useTeam from "../TeamContext/useTeam";
import { useNavigate } from "@/hooks/Navigation/useNavigate";
import { useNotificationText } from "@/hooks/Notification/useNotificationText";
import { useRealtimeMessage } from "@/hooks/Realtime/useRealtimeMessage";
import { useResync } from "@/hooks/Realtime/useResync";
import NotificationToastBody from "@/components/Notifications/NotificationToastBody";
import type { InboxContextValues, InboxListener } from "./Types";

/** `usePathname` carries no query; a path with one (a billing tab) must still match it. */
const pathnameOf = (path: string): string => path.split(/[?#]/, 1)[0];

const InboxContext = createContext<InboxContextValues>({
  unreadCount: 0,
  markRead: () => {},
  markAllRead: () => Promise.resolve(),
  open: () => {},
  subscribe: () => () => {},
});

/**
 * The user's Inbox across every Team: the unread count behind the navbar bell, a toast for each
 * Notification pushed while the app is open, and the one place reads happen, so the badge, the
 * lists on screen and the user's other tabs stay in step.
 */
export const InboxProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useAuth();
  const { teams, currentTeam, selectTeam } = useTeam();
  const { reload: reloadInvitations } = useInvitations();
  const { navigate } = useNavigate();
  const pathname = usePathname();
  const { notification: toast } = App.useApp();
  const textOf = useNotificationText();
  const [unreadCount, setUnreadCount] = useState(0);
  const listeners = useRef(new Set<InboxListener>());
  const countTicket = useRef(0);
  // What this tab already counted, so a toast clicked after its item was read elsewhere, or a
  // push delivered twice (a redelivery from the error queue), never moves the badge twice.
  const readIds = useRef(new Set<string>());
  const allReadAt = useRef(0);
  const pushedIds = useRef(new Set<string>());
  const toastIds = useRef(new Set<string>());
  const pendingTeam = useRef<{ teamId: string; pathname: string } | null>(null);

  const userId = currentUser?.id ?? null;

  const emit = useCallback((change: InboxChange) => {
    listeners.current.forEach((listener) => listener(change));
  }, []);

  const subscribe = useCallback((listener: InboxListener) => {
    listeners.current.add(listener);
    return () => {
      listeners.current.delete(listener);
    };
  }, []);

  const loadUnreadCount = useCallback(async () => {
    const mine = ++countTicket.current;
    try {
      const response = await GetUnreadNotificationCount();
      if (mine === countTicket.current) setUnreadCount(response.data?.count ?? 0);
    } catch {
      // The badge is a convenience; a failed read keeps the last count until the next resync.
    }
  }, []);

  const closeToasts = (ids: string[] = [...toastIds.current]) => {
    ids.forEach((id) => {
      toast.destroy(id);
      toastIds.current.delete(id);
    });
  };

  // Keyed on the user only: a new user starts from nothing, and a count still in flight for
  // the previous one is dropped.
  useEffect(() => {
    countTicket.current += 1;
    readIds.current.clear();
    pushedIds.current.clear();
    allReadAt.current = 0;
    pendingTeam.current = null;
    closeToasts();
    setUnreadCount(0);
    if (userId) void loadUnreadCount();
  }, [userId]);

  useResync(() => {
    if (userId) void loadUnreadCount();
  });

  const markRead = (notification: Notification) => {
    const known =
      !!notification.readAt ||
      readIds.current.has(notification.id) ||
      createdAtMs(notification) <= allReadAt.current;
    if (known) return;
    readIds.current.add(notification.id);
    setUnreadCount((count) => Math.max(0, count - 1));
    emit({ kind: "read", ids: [notification.id], at: new Date().toISOString() });
    closeToasts([notification.id]);
    MarkNotificationRead(notification.id).catch(() => {
      // Still unread on the server: the badge is re-read; the list catches up on its next load.
      readIds.current.delete(notification.id);
      void loadUnreadCount();
    });
  };

  const markAllRead = async () => {
    await MarkAllNotificationsRead();
    allReadAt.current = Date.now();
    countTicket.current += 1;
    setUnreadCount(0);
    emit({ kind: "readAll", at: new Date().toISOString() });
    closeToasts();
  };

  const open = (notification: Notification) => {
    markRead(notification);
    const path = notificationKind(notification).path(notification);
    if (!path) return;
    const teamId = notification.teamId;
    if (teamId && teamId !== currentTeam?.id && teams.some((team) => team.id === teamId)) {
      const target = pathnameOf(path);
      if (target === pathname) selectTeam(teamId);
      else pendingTeam.current = { teamId, pathname: target };
    }
    navigate(path);
  };

  // A toast is clicked long after it was shown; it must act on the current page and Team.
  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  });

  // The Team switch waits for the Notification's page: a page of the old Team (a Project's)
  // would otherwise see the switch first and redirect to the dashboard over the navigation.
  useEffect(() => {
    const pending = pendingTeam.current;
    pendingTeam.current = null;
    if (pending && pending.pathname === pathname) selectTeam(pending.teamId);
  }, [pathname]);

  const showToast = (notification: Notification) => {
    const { title, description } = textOf(notification);
    const teamName = notificationTeamName(notification, teams);
    toastIds.current.add(notification.id);
    toast[notificationKind(notification).tone]({
      key: notification.id,
      title,
      description:
        description || teamName ? (
          <NotificationToastBody description={description} teamName={teamName} />
        ) : undefined,
      placement: "topRight",
      className: "cursor-pointer",
      onClick: () => openRef.current(notification),
      onClose: () => {
        toastIds.current.delete(notification.id);
      },
    });
  };

  useRealtimeMessage("notification.created", (created) => {
    const notification: Notification = { ...created, params: created.params ?? {} };
    if (pushedIds.current.has(notification.id)) return;
    pushedIds.current.add(notification.id);
    emit({ kind: "created", notification });
    if (notificationKind(notification).refreshes === "invitations") void reloadInvitations();
    if (notification.readAt) return;
    setUnreadCount((count) => count + 1);
    showToast(notification);
  });

  useRealtimeMessage("notification.read", (read, at) => {
    if (read.all) {
      allReadAt.current = Math.max(allReadAt.current, Date.parse(at) || Date.now());
      countTicket.current += 1;
      setUnreadCount(0);
      emit({ kind: "readAll", at });
      closeToasts();
      return;
    }
    const ids = read.notificationIds ?? [];
    if (ids.length === 0) return;
    ids.forEach((id) => readIds.current.add(id));
    emit({ kind: "read", ids, at });
    closeToasts(ids.filter((id) => toastIds.current.has(id)));
    // Which of them were still unread here is unknown: they may never have been listed.
    void loadUnreadCount();
  });

  const value: InboxContextValues = {
    unreadCount,
    markRead,
    markAllRead,
    open,
    subscribe,
  };

  return <InboxContext.Provider value={value}>{children}</InboxContext.Provider>;
};

export default InboxContext;
