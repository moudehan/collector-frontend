import {
  Avatar,
  Box,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  TextField,
  Typography,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import EmailIcon from "@mui/icons-material/Email";
import FavoriteIcon from "@mui/icons-material/Favorite";
import SecurityIcon from "@mui/icons-material/Security";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

import { useState } from "react";

import AnimatedButton from "../../components/Button";
import UserPageLayout from "../../layout/UserPageLayout";

export default function ProfilePage() {
  const firstname = localStorage.getItem("firstname") || "Utilisateur";
  const email = localStorage.getItem("email") || "email@exemple.com";

  const [openEdit, setOpenEdit] = useState(false);
  const [newName, setNewName] = useState(firstname);

  function handleSave() {
    localStorage.setItem("firstname", newName);
    setOpenEdit(false);
    window.location.reload();
  }

  return (
    <UserPageLayout>
      <Box sx={{ maxWidth: 900, mx: "auto", p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
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

        <Card
          sx={{
            p: 4,
            borderRadius: 3,
            boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Avatar
              sx={{
                width: 90,
                height: 90,
                bgcolor: "#0047FF",
                fontSize: 32,
                border: "3px solid #e5e9fc",
              }}
            >
              {firstname[0].toUpperCase()}
            </Avatar>

            <Box>
              <Typography fontSize={24} fontWeight={800}>
                {firstname}
              </Typography>
              <Typography
                color="gray"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <EmailIcon fontSize="small" /> {email}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography fontWeight={700} mb={1}>
            Bio
          </Typography>
          <Typography color="gray" fontSize={15}>
            Bienvenue sur votre espace personnel Collector. Vous pouvez modifier
            vos informations, consulter votre activité et gérer votre sécurité.
          </Typography>
        </Card>

        <Typography fontSize={22} fontWeight={800} mt={4} mb={2}>
          Statistiques du compte
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 2,
          }}
        >
          <Card sx={{ p: 3, textAlign: "center", borderRadius: 3 }}>
            <ShoppingCartIcon sx={{ fontSize: 40, color: "#0047FF" }} />
            <Typography fontWeight={800} fontSize={20} mt={1}>
              12
            </Typography>
            <Typography color="gray">Achats effectués</Typography>
          </Card>

          <Card sx={{ p: 3, textAlign: "center", borderRadius: 3 }}>
            <FavoriteIcon sx={{ fontSize: 40, color: "#ff3377" }} />
            <Typography fontWeight={800} fontSize={20} mt={1}>
              48
            </Typography>
            <Typography color="gray">Articles favoris</Typography>
          </Card>

          <Card sx={{ p: 3, textAlign: "center", borderRadius: 3 }}>
            <SecurityIcon sx={{ fontSize: 40, color: "#00a86b" }} />
            <Typography fontWeight={800} fontSize={20} mt={1}>
              OK
            </Typography>
            <Typography color="gray">Sécurité du compte</Typography>
          </Card>
        </Box>

        <Typography fontSize={22} fontWeight={800} mt={4} mb={2}>
          Paramètres du compte
        </Typography>

        <Card
          sx={{
            p: 3,
            borderRadius: 3,
            boxShadow: "0 6px 15px rgba(0,0,0,0.05)",
          }}
        >
          <Typography fontWeight={700}>Informations personnelles</Typography>
          <Typography color="gray" fontSize={14}>
            Nom, prénom, email, préférences d'affichage...
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography fontWeight={700}>Sécurité</Typography>
          <Typography color="gray" fontSize={14}>
            Mot de passe, sessions actives, validation en 2 étapes.
          </Typography>
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
