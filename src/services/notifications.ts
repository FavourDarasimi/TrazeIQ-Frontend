import { API_ROUTES } from "@/constants";
import { api } from "@/lib/api";
import type { AlertPreferences, AppNotification } from "@/types";

export function listNotifications(limit = 20): Promise<{
  notifications: AppNotification[];
  unread_count: number;
}> {
  return api<{ notifications: AppNotification[]; unread_count: number }>(
    `${API_ROUTES.notifications}?limit=${limit}`,
  );
}

export function fetchUnreadCount(): Promise<{ unread_count: number }> {
  return api<{ unread_count: number }>(API_ROUTES.notificationUnreadCount);
}

export function markNotificationsRead(
  ids?: string[],
): Promise<{ marked: number; unread_count: number }> {
  return api<{ marked: number; unread_count: number }>(
    API_ROUTES.notificationMarkRead,
    { method: "POST", body: ids ? { ids } : {} },
  );
}

export function getAlertPreferences(): Promise<{ preferences: AlertPreferences }> {
  return api<{ preferences: AlertPreferences }>(API_ROUTES.alertPreferences);
}

export function updateAlertPreferences(
  patch: Partial<Omit<AlertPreferences, "updated_at">>,
): Promise<{ preferences: AlertPreferences }> {
  return api<{ preferences: AlertPreferences }>(API_ROUTES.alertPreferences, {
    method: "PATCH",
    body: patch,
  });
}