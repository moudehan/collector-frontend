import {
  Avatar,
  Box,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import EmailIcon from "@mui/icons-material/Email";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

import { useEffect, useState } from "react";

import AnimatedButton from "../../components/Button";
import UserPageLayout from "../../layout/UserPageLayout";

import {
  getNotificationSettings,
  updateNotificationSettings,
  type NotificationSettings,
} from "../../services/notification-settings.api";

export default function ProfilePage() {
  const firstname = localStorage.getItem("firstname") || "Utilisateur";
  const email = localStorage.getItem("email") || "email@exemple.com";

  const [openEdit, setOpenEdit] = useState(false);
  const [newName, setNewName] = useState(firstname);

  const [notifSettings, setNotifSettings] = useState<NotificationSettings>({
    NEW_ARTICLE: true,
    ARTICLE_UPDATED: true,
    MAIL_ENABLED: true,
  });

  useEffect(() => {
    (async () => {
      const data = await getNotificationSettings();
      setNotifSettings(data);
    })();
  }, []);

  function handleSave() {
    localStorage.setItem("firstname", newName);
    setOpenEdit(false);
    window.location.reload();
  }

  async function toggleNotif(type: keyof NotificationSettings) {
    const updated = {
      ...notifSettings,
      [type]: !notifSettings[type],
    };

    setNotifSettings(updated);
    await updateNotificationSettings(updated);
  }

  return (
    <UserPageLayout>
      <Box sx={{ maxWidth: 900, mx: "auto", p: 3 }}>
        <Box display="flex" justifyContent="space-between" mb={3}>
          <Typography fontSize={28} fontWeight={900}>
            Mon Profil
          </Typography>

          <AnimatedButton
            label="Modifier"
            variant="text"
            startIcon={<EditIcon />}
            onClick={() => setOpenEdit(true)}
          />
        </Box>

        <Card sx={{ p: 4, borderRadius: 3 }}>
          <Box display="flex" gap={3} alignItems="center">
            <Avatar
              sx={{ width: 90, height: 90, bgcolor: "#0047FF", fontSize: 32 }}
            >
              {firstname[0].toUpperCase()}
            </Avatar>

            <Box>
              <Typography fontSize={24} fontWeight={800}>
                {firstname}
              </Typography>
              <Typography
                color="gray"
                display="flex"
                alignItems="center"
                gap={1}
              >
                <EmailIcon fontSize="small" /> {email}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography fontWeight={700}>Bio</Typography>
          <Typography color="gray" fontSize={15}>
            Gérez vos informations personnelles et vos notifications.
          </Typography>
        </Card>

        <Typography fontSize={22} fontWeight={800} mt={4} mb={2}>
          Statistiques du compte
        </Typography>

        <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={2}>
          <Card sx={{ p: 3, textAlign: "center" }}>
            <ShoppingCartIcon color="primary" sx={{ fontSize: 40 }} />
            <Typography fontWeight={800}>12</Typography>
            <Typography color="gray">Achats</Typography>
          </Card>

          <Card sx={{ p: 3, textAlign: "center" }}>
            <FavoriteIcon sx={{ color: "#ff3377", fontSize: 40 }} />
            <Typography fontWeight={800}>48</Typography>
            <Typography color="gray">Favoris</Typography>
          </Card>

          <Card sx={{ p: 3, textAlign: "center" }}>
            <ShoppingCartIcon color="primary" sx={{ fontSize: 40 }} />
            <Typography fontWeight={800}>12</Typography>
            <Typography color="gray">Achats</Typography>
          </Card>
        </Box>

        <Typography fontSize={22} fontWeight={800} mt={4}>
          Paramétres du compte
        </Typography>

        <Card sx={{ p: 3, mt: 2 }}>
          <Typography fontWeight={700}>Informations personnelles</Typography>
          <Typography color="gray" fontSize={14}>
            Nom, prénom, email, préférences d'affichage...
          </Typography>

          <Divider sx={{ my: 4 }} />

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
        <DialogTitle fontWeight={800}>Modifier votre nom</DialogTitle>

        <DialogContent>
          <TextField
            label="Nom d'utilisateur"
            fullWidth
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            sx={{ mt: 1 }}
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
