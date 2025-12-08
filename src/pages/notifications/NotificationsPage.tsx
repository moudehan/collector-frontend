import NotificationsIcon from "@mui/icons-material/Notifications";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Pagination,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserPageLayout from "../../layout/UserPageLayout";

import {
  getUserNotifications,
  markAllNotificationsAsRead,
  markAllNotificationsAsUnread,
  markNotificationAsRead,
} from "../../services/notifications.api";

import { useArticleNotifications } from "../../services/socket";

type NotificationItem = {
  id: string;
  type: string;
  is_read: boolean;
  created_at: string;
  payload: {
    article_id?: string;
    title?: string;
    message?: string;
  };
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    (async () => {
      const data = await getUserNotifications();
      setNotifications(data);
    })();
  }, []);

  useArticleNotifications((notif) => {
    setNotifications((prev) => [
      {
        id: notif.id,
        type: notif.type,
        is_read: false,
        created_at: notif.created_at,
        payload: {
          article_id: notif.article_id,
          title: notif.title,
          message: notif.message,
        },
      },
      ...prev,
    ]);
  });

  const sorted = useMemo(() => {
    return [...notifications].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [notifications]);

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const visible = sorted.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  async function handleClick(notif: NotificationItem) {
    if (!notif.is_read) {
      await markNotificationAsRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
      );
    }

    if (notif.payload?.article_id) {
      navigate(`/article/detail/${notif.payload.article_id}`);
    }
  }

  async function handleMarkAllRead() {
    await markAllNotificationsAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  async function handleMarkAllUnread() {
    await markAllNotificationsAsUnread();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: false })));
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <UserPageLayout>
      <Box sx={{ maxWidth: 900, mx: "auto", p: 3 }}>
        <Box display="flex" justifyContent="space-between" mb={3}>
          <Typography fontSize={28} fontWeight={900}>
            Mes notifications
          </Typography>

          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
            >
              Tout marquer comme lu
            </Button>

            <Button
              variant="outlined"
              color="warning"
              onClick={handleMarkAllUnread}
              disabled={unreadCount === notifications.length}
            >
              Tout marquer comme non lu
            </Button>
          </Box>
        </Box>

        {visible.map((notif) => (
          <Card
            key={notif.id}
            onClick={() => handleClick(notif)}
            sx={{
              p: 2.5,
              mb: 2,
              borderRadius: 3,
              cursor: "pointer",
              background: notif.is_read ? "#fff" : "#eef4ff",
              boxShadow: notif.is_read
                ? "0 4px 15px rgba(0,0,0,0.08)"
                : "0 6px 20px rgba(30,79,255,0.25)",
            }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Badge variant="dot" color="error" invisible={notif.is_read}>
                <Avatar sx={{ bgcolor: "#1e4fff" }}>
                  <NotificationsIcon />
                </Avatar>
              </Badge>

              <Box flex={1}>
                <Typography fontWeight={800}>
                  {notif.type === "ARTICLE_UPDATED"
                    ? "Article mis à jour"
                    : "Nouvel article publié"}
                </Typography>

                <Typography color="gray" fontSize={14}>
                  {notif.payload?.title ||
                    notif.payload?.message ||
                    "Nouvelle notification"}
                </Typography>
              </Box>

              <Typography fontSize={12} color="gray">
                {new Date(notif.created_at).toLocaleString()}
              </Typography>
            </Box>
          </Card>
        ))}

        {totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={4}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
              size="large"
            />
          </Box>
        )}
      </Box>
    </UserPageLayout>
  );
}
