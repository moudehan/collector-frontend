import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import LanguageIcon from "@mui/icons-material/Language";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

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
import AnimatedButton from "./Button";
import type { Item } from "./DropDownList";
import DropdownList from "./DropDownList";

import {
  getUserNotifications,
  markAllNotificationsAsRead,
  markAllNotificationsAsUnread,
  markNotificationAsRead,
} from "../services/notifications.api";

import keycloak from "../../keycloak";
import { useCart } from "../contexte/cart/useCart";
import { useConversationUnread } from "../contexte/ConversationUnreadContext";
import { useAuth } from "../contexte/UseAuth";
import { useArticleNotifications } from "../services/socket";

function getNotifTitle(type: string): string {
  switch (type) {
    case "NEW_ARTICLE":
      return "Nouvel article ajouté";
    case "ARTICLE_UPDATED":
      return "Article mis à jour";
    case "ARTICLE_REJECTED":
      return "Article rejeté";
    case "ARTICLE_APPROUVED":
      return "Article approuvé";
    default:
      return "Notification";
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getNotifSubtitle(type: string, payloadOrRaw: any): string {
  switch (type) {
    case "ARTICLE_UPDATED":
      return (
        payloadOrRaw?.message ?? payloadOrRaw?.title ?? "Article mis à jour"
      );

    case "ARTICLE_REJECTED":
      return (
        payloadOrRaw?.reason ??
        payloadOrRaw?.message ??
        payloadOrRaw?.title ??
        "Votre article a été rejeté"
      );

    case "ARTICLE_APPROUVED":
      return (
        payloadOrRaw?.message ?? "Votre article a été approuvé automatiquement"
      );

    case "NEW_ARTICLE":
      return payloadOrRaw?.title ?? payloadOrRaw?.message ?? "Nouvel article";

    default:
      return (
        payloadOrRaw?.title ?? payloadOrRaw?.message ?? "Nouvelle notification"
      );
  }
}

export default function AppNavbar() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { unreadCount: unreadConversationsCount } = useConversationUnread();
  const { cartItemsCount } = useCart();

  const [openDrawer, setOpenDrawer] = useState(false);
  const toggleDrawer = () => setOpenDrawer((prev) => !prev);

  const [notifAnchor, setNotifAnchor] = useState<HTMLElement | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const [notifications, setNotifications] = useState<Item[]>([]);

  useEffect(() => {
    if (!user) {
      return;
    }

    (async () => {
      const data = await getUserNotifications();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formatted: Item[] = data.map((n: any) => ({
        id: n.id,
        title: getNotifTitle(n.type),
        subtitle: getNotifSubtitle(n.type, n.payload),
        is_read: n.is_read,
        article_id: n.payload?.article_id,
        type: n.type,
      }));

      setNotifications(formatted);
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
          title: getNotifTitle(raw.type),
          subtitle: getNotifSubtitle(raw.type, raw),
          is_read: false,
          article_id: raw.article_id,
          type: raw.type,
        },
        ...prev,
      ];
    });
  });

  const unreadNotifCount = notifications.filter((n) => !n.is_read).length;

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
              } else {
                navigate("/");
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
                  <Badge badgeContent={unreadNotifCount} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>

                <IconButton
                  onClick={() => navigate("/conversations")}
                  title="Mes conversations"
                >
                  <Badge badgeContent={unreadConversationsCount} color="error">
                    <ChatBubbleOutlineIcon />
                  </Badge>
                </IconButton>
                <IconButton
                  onClick={() => navigate("/cart")}
                  title="Mon panier"
                >
                  <Badge badgeContent={cartItemsCount} color="error">
                    <ShoppingCartIcon />
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
                      if (!item.article_id) return;
                      if (
                        item.type === "ARTICLE_REJECTED" ||
                        item.type === "ARTICLE_APPROUVED"
                      ) {
                        navigate(`/article/${item.article_id}`);
                      } else {
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
              <IconButton onClick={toggleDrawer} data-cy="open-user-drawer">
                <Avatar>{user.userName?.[0]?.toUpperCase() ?? "U"}</Avatar>
              </IconButton>
            )}
            {!user && (
              <AnimatedButton
                label="Se connecter"
                variant="outlined"
                sx={{ border: 1 }}
                width="auto"
                onClick={() => {
                  keycloak.login({
                    redirectUri: window.location.origin + "/Home",
                  });
                }}
              />
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {user && <UserMenuDrawer open={openDrawer} onClose={toggleDrawer} />}
    </>
  );
}
