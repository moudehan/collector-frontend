import axios from "axios";
export type NotificationSettings = {
  NEW_ARTICLE: boolean;
  ARTICLE_UPDATED: boolean;
  MAIL_ENABLED: boolean;
};
const API_URL = import.meta.env.VITE_API_URL;

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
