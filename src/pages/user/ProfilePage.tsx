import {
  Avatar,
  Box,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import ArticleIcon from "@mui/icons-material/Article";
import EditIcon from "@mui/icons-material/Edit";
import EmailIcon from "@mui/icons-material/Email";
import FavoriteIcon from "@mui/icons-material/Notifications";
import ShopIcon from "@mui/icons-material/Storefront";

import { useEffect, useState } from "react";

import AnimatedButton from "../../components/Button";
import UserPageLayout from "../../layout/UserPageLayout";

import { useNavigate } from "react-router-dom";
import {
  getNotificationSettings,
  updateNotificationSettings,
  type NotificationSettings,
} from "../../services/notification-settings.api";
import { getMe, updateMe } from "../../services/users.api";
import type { User } from "../../types/user.type";

export default function ProfilePage() {
  const [openEdit, setOpenEdit] = useState(false);
  const [profile, setProfile] = useState<User>();
  const [editForm, setEditForm] = useState({
    firstname: "",
    lastname: "",
    userName: "",
    email: "",
  });

  const [notifSettings, setNotifSettings] = useState<NotificationSettings>({
    NEW_ARTICLE: true,
    ARTICLE_UPDATED: true,
    ARTICLE_REJECTED: true,
    ARTICLE_APPROUVED: true,
    MAIL_ENABLED: true,
  });

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const me = await getMe();
      setProfile(me);
      setEditForm({
        firstname: me.firstname,
        lastname: me.lastname,
        userName: me.userName,
        email: me.email,
      });
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const data = await getNotificationSettings();
      setNotifSettings(data);
    })();
  }, []);

  async function handleSave() {
    await updateMe(editForm);

    const refreshed = await getMe();
    setProfile(refreshed);
    setOpenEdit(false);
  }

  async function toggleNotif(type: keyof NotificationSettings) {
    const updated = {
      ...notifSettings,
      [type]: !notifSettings[type],
    };

    setNotifSettings(updated);
    await updateNotificationSettings(updated);
  }
  if (!profile) return null;

  const MAIN_COLOR = "#0047FF";

  return (
    <UserPageLayout>
      <Box sx={{ maxWidth: 900, mx: "auto", p: 3 }}>
        <Box display="flex" justifyContent="space-between" mb={3}>
          <Typography fontSize={28} fontWeight={900}>
            Mon Profil
          </Typography>
          <Tooltip title="n'est pas encore implementé via keycloak">
            <AnimatedButton
              label="Modifier"
              variant="text"
              startIcon={<EditIcon />}
              onClick={() => setOpenEdit(true)}
              disabled
            />
          </Tooltip>
        </Box>

        <Card sx={{ p: 4, borderRadius: 3 }}>
          <Box display="flex" gap={3} alignItems="center">
            <Avatar
              sx={{ width: 90, height: 90, bgcolor: "#0047FF", fontSize: 32 }}
            >
              {profile.firstname[0].toUpperCase()}
            </Avatar>

            <Box>
              <Typography fontSize={24} fontWeight={800}>
                {profile.userName}
              </Typography>
              <Typography
                color="gray"
                display="flex"
                alignItems="center"
                gap={1}
              >
                <EmailIcon fontSize="small" /> {profile.email}
              </Typography>
            </Box>
          </Box>
        </Card>

        <Typography fontSize={22} fontWeight={800} mt={4} mb={2}>
          Statistiques du compte
        </Typography>

        <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={2}>
          <Card
            sx={{
              p: 3,
              textAlign: "center",
              cursor: "pointer",
              transition: "0.2s",
              "&:hover": { transform: "scale(1.03)", boxShadow: 6 },
            }}
            onClick={() => navigate("ShopManagement")}
          >
            <ArticleIcon sx={{ fontSize: 42, color: MAIN_COLOR }} />
            <Typography fontWeight={800} fontSize={20}>
              {profile.stats.totalArticles}
            </Typography>
            <Typography color="gray">Articles</Typography>
          </Card>

          <Card
            sx={{
              p: 3,
              textAlign: "center",
              cursor: "pointer",
              transition: "0.2s",
              "&:hover": { transform: "scale(1.03)", boxShadow: 6 },
            }}
            onClick={() => navigate("/notifications")}
          >
            <FavoriteIcon sx={{ fontSize: 42, color: MAIN_COLOR }} />
            <Typography fontWeight={800} fontSize={20}>
              {profile.stats.totalNotifications}
            </Typography>
            <Typography color="gray">Notifications</Typography>
          </Card>

          <Card
            sx={{
              p: 3,
              textAlign: "center",
              cursor: "pointer",
              transition: "0.2s",
              "&:hover": { transform: "scale(1.03)", boxShadow: 6 },
            }}
            onClick={() => navigate("/ShopManagement")}
          >
            <ShopIcon sx={{ fontSize: 42, color: MAIN_COLOR }} />
            <Typography fontWeight={800} fontSize={20}>
              {profile.stats.totalShops}
            </Typography>
            <Typography color="gray">Boutiques</Typography>
          </Card>
        </Box>

        <Typography fontSize={22} fontWeight={800} mt={4}>
          Paramétres du compte
        </Typography>

        <Card sx={{ p: 3, mt: 2 }}>
          <Typography fontWeight={700}>Paramètres des notifications</Typography>

          <Box display="flex" justifyContent="space-between" my={2} px={4}>
            <Box>
              <Typography fontWeight={700}>Nouveaux articles</Typography>
              <Typography fontSize={13} color="gray">
                Recevoir une notification lors d’une nouvelle publication
              </Typography>
            </Box>

            <Switch
              checked={notifSettings.NEW_ARTICLE}
              onChange={() => toggleNotif("NEW_ARTICLE")}
            />
          </Box>

          <Box display="flex" justifyContent="space-between" mb={2} px={4}>
            <Box>
              <Typography fontWeight={700}>Article mis à jour</Typography>
              <Typography fontSize={13} color="gray">
                Notification si un article que vous suivez est modifié
              </Typography>
            </Box>

            <Switch
              checked={notifSettings.ARTICLE_UPDATED}
              onChange={() => toggleNotif("ARTICLE_UPDATED")}
            />
          </Box>

          <Box display="flex" justifyContent="space-between" mb={2} px={4}>
            <Box>
              <Typography fontWeight={700}>Article rejeté</Typography>
              <Typography fontSize={13} color="gray">
                Être notifié quand un de vos articles est rejeté
              </Typography>
            </Box>

            <Switch
              checked={notifSettings.ARTICLE_REJECTED ?? true}
              onChange={() => toggleNotif("ARTICLE_REJECTED")}
            />
          </Box>

          <Box display="flex" justifyContent="space-between" mb={2} px={4}>
            <Box>
              <Typography fontWeight={700}>Article approuvé</Typography>
              <Typography fontSize={13} color="gray">
                Être notifié quand votre article est approuvé automatiquement
              </Typography>
            </Box>

            <Switch
              checked={notifSettings.ARTICLE_APPROUVED ?? true}
              onChange={() => toggleNotif("ARTICLE_APPROUVED")}
            />
          </Box>

          <Box display="flex" justifyContent="space-between" mb={2} px={4}>
            <Box display="flex" alignItems="center" gap={1}>
              <EmailIcon color="primary" />
              <Box>
                <Typography fontWeight={700}>
                  Notifications par email
                </Typography>
                <Typography fontSize={13} color="gray">
                  Recevoir aussi les notifications par mail
                </Typography>
              </Box>
            </Box>

            <Switch
              checked={notifSettings.MAIL_ENABLED}
              onChange={() => toggleNotif("MAIL_ENABLED")}
            />
          </Box>
        </Card>
      </Box>

      <Dialog
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle fontWeight={800}>Modifier vos informations</DialogTitle>

        <DialogContent>
          <TextField
            label="Prénom"
            fullWidth
            value={editForm.firstname}
            onChange={(e) =>
              setEditForm({ ...editForm, firstname: e.target.value })
            }
            sx={{ mt: 1 }}
          />

          <TextField
            label="Nom"
            fullWidth
            value={editForm.lastname}
            onChange={(e) =>
              setEditForm({ ...editForm, lastname: e.target.value })
            }
            sx={{ mt: 2 }}
          />

          <TextField
            label="Nom d'utilisateur"
            fullWidth
            value={editForm.userName}
            onChange={(e) =>
              setEditForm({ ...editForm, userName: e.target.value })
            }
            sx={{ mt: 2 }}
          />

          <TextField
            label="Email"
            fullWidth
            value={editForm.email}
            onChange={(e) =>
              setEditForm({ ...editForm, email: e.target.value })
            }
            sx={{ mt: 2 }}
          />
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <AnimatedButton
            label="Enregistrer"
            width="100%"
            onClick={handleSave}
          />
        </DialogActions>
      </Dialog>
    </UserPageLayout>
  );
}
