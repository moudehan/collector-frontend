import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import LanguageIcon from "@mui/icons-material/Language";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchIcon from "@mui/icons-material/Search";

import {
  AppBar,
  Avatar,
  Badge,
  Box,
  IconButton,
  InputAdornment,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserMenuDrawer from "../layout/UserMenuDrawer";
import AuthModal from "../pages/AuthModal";
import AnimatedButton from "./Button";
import type { Item } from "./DropDownList";
import DropdownList from "./DropDownList";

import {
  getUserNotifications,
  markAllNotificationsAsRead,
  markAllNotificationsAsUnread,
  markNotificationAsRead,
} from "../services/notifications.api";

import { useAuth } from "../contexte/UseAuth";
import { useArticleNotifications } from "../services/socket";

export default function AppNavbar() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [openAuth, setOpenAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [openDrawer, setOpenDrawer] = useState(false);
  const toggleDrawer = () => setOpenDrawer(!openDrawer);

  const [notifAnchor, setNotifAnchor] = useState<HTMLElement | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const [notifications, setNotifications] = useState<Item[]>([]);

  useEffect(() => {
    if (!user) return;

    (async () => {
      const data = await getUserNotifications();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formatted = data.map((n: any) => ({
        id: n.id,
        title:
          n.type === "NEW_ARTICLE"
            ? "Nouvel article ajouté"
            : n.type === "ARTICLE_UPDATED"
            ? "Article mis à jour"
            : "Notification",
        subtitle:
          n.type === "ARTICLE_UPDATED"
            ? n.payload?.message
            : n.payload?.title ?? n.payload?.message ?? "Nouvelle notification",
        is_read: n.is_read,
        article_id: n.payload?.article_id,
        type: n.type,
      }));

      setNotifications((prev) => {
        const merged = [...formatted];

        prev.forEach((oldNotif) => {
          if (!merged.some((n) => n.id === oldNotif.id)) {
            merged.push(oldNotif);
          }
        });

        return merged;
      });
    })();
  }, [user]);

  useArticleNotifications((raw) => {
    if (!raw?.id || !raw?.type || !raw?.article_id) return;
    setNotifications((prev) => {
      const exists = prev.some((n) => n.id === raw.id);
      if (exists) return prev;

      return [
        {
          id: raw.id,
          title:
            raw.type === "ARTICLE_UPDATED"
              ? "Article mis à jour"
              : "Nouvel article ajouté",
          subtitle: raw.type === "ARTICLE_UPDATED" ? raw.message : raw.title,
          is_read: false,
          article_id: raw.article_id,
          type: raw.type,
        },
        ...prev,
      ];
    });
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  if (loading) return null;

  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: "#fff",
          borderBottom: "1px solid #e5e5e5",
          py: 0.5,
          pl: 10,
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography
            variant="h5"
            fontWeight={1000}
            sx={{ color: "#1e4fff", cursor: "pointer" }}
            onClick={() => {
              if (user) {
                navigate("/Home");
              }
            }}
          >
            COLLECTOR<span style={{ color: "#000" }}>.shop</span>
          </Typography>

          <Box sx={{ flexGrow: 0.6 }}>
            <TextField
              fullWidth
              placeholder="Rechercher une marque, un modèle..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#1e4fff" }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {user && (
              <>
                <IconButton onClick={(e) => setNotifAnchor(e.currentTarget)}>
                  <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>

                <DropdownList
                  anchorEl={notifAnchor}
                  open={Boolean(notifAnchor)}
                  onClose={() => setNotifAnchor(null)}
                  items={notifications.slice(0, visibleCount)}
                  emptyText="Aucune notification"
                  onItemClick={async (item) => {
                    setNotifications((prev) =>
                      prev.map((n) =>
                        n.id === item.id ? { ...n, is_read: true } : n
                      )
                    );

                    await markNotificationAsRead(item.id);

                    setNotifAnchor(null);

                    requestAnimationFrame(() => {
                      if (item.article_id) {
                        navigate(`/article/detail/${item.article_id}`);
                      }
                    });
                  }}
                  onMarkAllRead={async () => {
                    await markAllNotificationsAsRead();
                    setNotifications((prev) =>
                      prev.map((n) => ({ ...n, is_read: true }))
                    );
                  }}
                  onMarkAllUnread={async () => {
                    await markAllNotificationsAsUnread();
                    setNotifications((prev) =>
                      prev.map((n) => ({ ...n, is_read: false }))
                    );
                  }}
                  onViewAll={() => navigate("/notifications")}
                  onLoadMore={() => setVisibleCount((prev) => prev + 10)}
                  hasMore={visibleCount < notifications.length}
                />
              </>
            )}

            <FavoriteBorderIcon />
            <LanguageIcon />
            {user && (
              <>
                <IconButton onClick={toggleDrawer}>
                  <Avatar>{user.userName?.[0]?.toUpperCase() ?? "U"}</Avatar>
                </IconButton>
              </>
            )}
            {!user && (
              <AnimatedButton
                label="Se connecter"
                variant="outlined"
                sx={{ border: 1 }}
                width="auto"
                onClick={() => {
                  setAuthMode("login");
                  setOpenAuth(true);
                }}
              />
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <AuthModal
        open={openAuth}
        onClose={() => setOpenAuth(false)}
        mode={authMode}
        setMode={setAuthMode}
      />
      {user && <UserMenuDrawer open={openDrawer} onClose={toggleDrawer} />}
    </>
  );
}
