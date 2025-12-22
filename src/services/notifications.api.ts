const API_URL = import.meta.env.VITE_API_URL;

export async function getUserNotifications() {
  const token = localStorage.getItem("UserToken");

  const res = await fetch(`${API_URL}/notifications/my`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
}

export async function markNotificationAsRead(id: string) {
  const token = localStorage.getItem("UserToken");

  await fetch(`${API_URL}/notifications/read/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function markAllNotificationsAsRead() {
  const token = localStorage.getItem("UserToken");

  await fetch(`${API_URL}/notifications/read-all`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function markAllNotificationsAsUnread() {
  const token = localStorage.getItem("UserToken");

  await fetch(`${API_URL}/notifications/unread-all`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
