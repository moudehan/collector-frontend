import axios from "axios";
import { API_URL } from "../config";
export type NotificationSettings = {
  NEW_ARTICLE: boolean;
  ARTICLE_UPDATED: boolean;
  MAIL_ENABLED: boolean;
};

export async function getNotificationSettings(): Promise<NotificationSettings> {
  const res = await axios.get(
    `${API_URL}/notifications/notification-settings`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("UserToken")}`,
      },
    }
  );

  return res.data;
}

export async function updateNotificationSettings(
  settings: NotificationSettings
) {
  const res = await axios.patch(
    `${API_URL}/notifications/notification-settings`,
    settings,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("UserToken")}`,
      },
    }
  );

  return res.data;
}
