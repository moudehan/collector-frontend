import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import LanguageIcon from "@mui/icons-material/Language";
import MenuIcon from "@mui/icons-material/Menu";
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

import { useArticleNotifications } from "../services/socket";

export default function AppNavbar() {
  const token = localStorage.getItem("UserToken");
  const firstname = localStorage.getItem("firstname") || "U";
  const navigate = useNavigate();

  const [openAuth, setOpenAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [openDrawer, setOpenDrawer] = useState(false);
  const toggleDrawer = () => setOpenDrawer(!openDrawer);

  const [notifAnchor, setNotifAnchor] = useState<HTMLElement | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const [notifications, setNotifications] = useState<Item[]>([]);

  useEffect(() => {
    if (!token) return;

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
  }, [token]);

  useArticleNotifications((notif) => {
    setNotifications((prev) => {
      const exists = prev.some((n) => n.id === notif.id);
      if (exists) return prev;

      return [
        {
          id: notif.id,
          title:
            notif.type === "ARTICLE_UPDATED"
              ? "Article mis à jour"
              : "Nouvel article ajouté",
          subtitle:
            notif.type === "ARTICLE_UPDATED" ? notif.message : notif.title,
          is_read: false,
          article_id: notif.article_id,
          type: notif.type,
        },
        ...prev,
      ];
    });
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

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
              window.location.href = "/";
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
            {token && (
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
                    // ✅ 1. MAJ LOCALE IMMÉDIATE
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

            {token && (
              <>
                <Avatar>{firstname[0]}</Avatar>
                <IconButton onClick={toggleDrawer}>
                  <MenuIcon />
                </IconButton>
              </>
            )}
            {!token && (
              <AnimatedButton
                label="Se connecter"
                variant="outlined"
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
      <UserMenuDrawer
        open={openDrawer}
        onClose={toggleDrawer}
        firstname={firstname}
      />
    </>
  );
}
