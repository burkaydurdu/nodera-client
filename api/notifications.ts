import APIClient from "./client";
import type {
  ListNotificationsQuery,
  MarkedNotificationCount,
  Notification,
  UnreadNotificationCount,
} from "@/core/notification";

export const ListNotifications = (query: ListNotificationsQuery = {}) =>
  APIClient.get<Notification[]>("/v1/notifications", { params: query });

export const GetUnreadNotificationCount = () =>
  APIClient.get<UnreadNotificationCount>("/v1/notifications/unread-count");

export const MarkNotificationRead = (notificationId: string) =>
  APIClient.put<Notification>(`/v1/notifications/${notificationId}/read`);

export const MarkAllNotificationsRead = () =>
  APIClient.put<MarkedNotificationCount>("/v1/notifications/read-all");
