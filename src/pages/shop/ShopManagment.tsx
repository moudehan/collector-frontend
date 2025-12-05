import AddIcon from "@mui/icons-material/Add";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CloseIcon from "@mui/icons-material/Close";
import StorefrontIcon from "@mui/icons-material/Storefront";

import {
  Box,
  Card,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";

import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import AnimatedButton from "../../components/Button";
import UserPageLayout from "../../layout/UserPageLayout";
import { createShop, getMyShops } from "../../services/shop.api";
import type { Shop } from "../../types/shop.type";

export default function CreateShopPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [openModal, setOpenModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const shopsPerPage = 9;
  const totalPages = Math.ceil(shops.length / shopsPerPage);

  const startIndex = (currentPage - 1) * shopsPerPage;
  const displayedShops = shops.slice(startIndex, startIndex + shopsPerPage);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const data = await getMyShops();
        setShops(data);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  async function handleCreateShop() {
    try {
      await createShop({ name, description });
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <UserPageLayout>
      <Container sx={{ py: 4, maxWidth: "900px" }}>
        <Box
          sx={{
            background: "linear-gradient(135deg, #7DB4FF, #4C73FF)",
            color: "#fff",
            py: 5,
            px: 4,
            textAlign: "center",
            mb: 6,
            borderRadius: 3,
            boxShadow: "0px 8px 35px rgba(0,0,0,0.15)",
          }}
        >
          <Typography fontSize={36} fontWeight={900}>
            Gérer vos boutiques 🛍️
          </Typography>

          <Typography fontSize={18} mt={1} color="rgba(255,255,255,0.9)">
            Consultez vos boutiques ou créez-en une nouvelle.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <AnimatedButton
            label="Créer une boutique"
            startIcon={<AddIcon />}
            sx={{ px: 3 }}
            width="auto"
            onClick={() => setOpenModal(true)}
          />
        </Box>

        <Typography variant="h5" fontWeight={700} mb={2}>
          Vos boutiques
          <Typography component="span" fontWeight={600}>
            (Total : {shops.length})
          </Typography>
        </Typography>

        {shops.length === 0 ? (
          <Typography color="gray" mb={3}>
            Vous n’avez encore aucune boutique.
          </Typography>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 3,
              mb: 4,
            }}
          >
            {displayedShops.map((shop) => (
              <Card
                key={shop.id}
                onClick={() => navigate(`/shop/${shop.id}`)}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  cursor: "pointer",
                  transition: "0.22s",
                  textAlign: "center",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 25px rgba(0,0,0,0.12)",
                    backgroundColor: "#f8faff",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 70,
                    height: 70,
                    borderRadius: "16px",
                    backgroundColor: "#E8EEFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 2,
                  }}
                >
                  <StorefrontIcon sx={{ fontSize: 36, color: "#4C73FF" }} />
                </Box>

                <Typography
                  fontSize={18}
                  fontWeight={700}
                  sx={{ lineHeight: 1.2 }}
                >
                  {shop.name}
                </Typography>

                <Typography color="gray" fontSize={14} sx={{ mt: 1 }}>
                  {shop.description}
                </Typography>
              </Card>
            ))}
          </Box>
        )}

        {totalPages > 1 ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 2,
              mt: 3,
            }}
          >
            <IconButton
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              sx={{ bgcolor: "#f1f3f8", "&:hover": { bgcolor: "#e2e6ef" } }}
            >
              <ArrowBackIosNewIcon fontSize="small" />
            </IconButton>

            <Typography
              sx={{
                px: 3,
                py: 1,
                borderRadius: 2,
                fontWeight: 700,
                bgcolor: "#E8EEFF",
                color: "#4C73FF",
              }}
            >
              {currentPage} / {totalPages}
            </Typography>

            <IconButton
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              sx={{ bgcolor: "#f1f3f8", "&:hover": { bgcolor: "#e2e6ef" } }}
            >
              <ArrowForwardIosIcon fontSize="small" />
            </IconButton>
          </Box>
        ) : (
          <Box sx={{ textAlign: "center", mt: 3 }}>
            <Typography
              sx={{
                px: 3,
                py: 1,
                borderRadius: 2,
                fontWeight: 700,
                bgcolor: "#E8EEFF",
                color: "#4C73FF",
                display: "inline-block",
              }}
            >
              1 / 1
            </Typography>
          </Box>
        )}

        <Dialog
          open={openModal}
          onClose={() => setOpenModal(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle
            sx={{
              fontWeight: 800,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 22,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <StorefrontIcon sx={{ color: "#4C73FF" }} /> Ajouter une boutique
            </Box>
            <IconButton onClick={() => setOpenModal(false)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <Divider sx={{ my: 2 }} />

          <DialogContent>
            <TextField
              fullWidth
              label="Nom de la boutique"
              placeholder="Ex : RetroGaming Store"
              sx={{ mb: 3 }}
              onChange={(e) => setName(e.target.value)}
            />

            <TextField
              fullWidth
              label="Description"
              multiline
              rows={4}
              placeholder="Décrivez votre boutique..."
              sx={{ mb: 3 }}
              onChange={(e) => setDescription(e.target.value)}
            />
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3 }}>
            <AnimatedButton
              label="Créer la boutique"
              width="100%"
              onClick={handleCreateShop}
            />
          </DialogActions>
        </Dialog>
      </Container>
    </UserPageLayout>
  );
}
