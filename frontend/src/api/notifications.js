import { apiGet, apiPost } from "./client";

export const getNotifications = (unreadOnly = false) =>
  apiGet(`/notifications${unreadOnly ? "?unread=1" : ""}`);

export const markNotificationRead = (id) =>
  apiPost(`/notifications/${id}/read`);
