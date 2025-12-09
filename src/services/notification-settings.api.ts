import axios from "axios";

const API_URL = "http://localhost:4000";

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
