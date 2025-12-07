import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Divider,
  MenuItem,
  Pagination,
  Select,
  Typography,
} from "@mui/material";

import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";

import UserPageLayout from "../../layout/UserPageLayout";

export default function SalesHistory() {
  const sales = [
    {
      id: 1,
      title: "Nike Dunk Low",
      price: 189,
      date: "14 Jan 2025",
      status: "Paiement reçu",
      buyer: "Alex M.",
      image:
        "https://images.unsplash.com/photo-1526158189979-02d6e7b9da7d?q=80&w=400",
    },
    {
      id: 2,
      title: "Sweat Supreme",
      price: 99,
      date: "02 Jan 2025",
      status: "En attente d’expédition",
      buyer: "Julie R.",
      image:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=400",
    },
  ];

  return (
    <UserPageLayout>
      <Box sx={{ maxWidth: 900, mx: "auto", p: 3 }}>
        <Typography fontSize={28} fontWeight={900} mb={3}>
          Historique de ventes
        </Typography>

        <Card
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 3,
            boxShadow: "0 3px 18px rgba(0,0,0,0.06)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Select defaultValue="recent" sx={{ minWidth: 160 }}>
            <MenuItem value="recent">Plus récent</MenuItem>
            <MenuItem value="old">Plus ancien</MenuItem>
            <MenuItem value="priceUp">Prix croissant</MenuItem>
            <MenuItem value="priceDown">Prix décroissant</MenuItem>
          </Select>

          <Select defaultValue="all" sx={{ minWidth: 160 }}>
            <MenuItem value="all">Tous les statuts</MenuItem>
            <MenuItem value="paid">Paiement reçu</MenuItem>
            <MenuItem value="pending">En attente</MenuItem>
            <MenuItem value="shipped">Expédié</MenuItem>
          </Select>
        </Card>

        {sales.map((s) => (
          <Card
            key={s.id}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 3,
              boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
            }}
          >
            <Box sx={{ display: "flex", gap: 2 }}>
              <Avatar
                variant="rounded"
                src={s.image}
                sx={{ width: 90, height: 90, borderRadius: 2 }}
              />

              <Box sx={{ flexGrow: 1 }}>
                <Typography fontSize={18} fontWeight={800}>
                  {s.title}
                </Typography>

                <Typography color="gray" fontSize={14}>
                  {s.price} € — vendu le {s.date}
                </Typography>

                <Typography fontSize={14} sx={{ mt: 0.5 }}>
                  Acheteur : <b>{s.buyer}</b>
                </Typography>

                <Chip
                  label={s.status}
                  color={
                    s.status === "Paiement reçu"
                      ? "success"
                      : s.status.includes("expédition")
                      ? "warning"
                      : "default"
                  }
                  sx={{ mt: 1, fontWeight: 700 }}
                />
              </Box>

              <Button
                onClick={() => (window.location.href = `/articles/${s.id}`)}
                endIcon={<ArrowForwardIosIcon />}
                sx={{ whiteSpace: "nowrap" }}
              >
                Voir l’article
              </Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Button
                variant="contained"
                startIcon={<LocalShippingIcon />}
                sx={{ bgcolor: "#0047FF" }}
                onClick={() => alert("Gestion de l’expédition…")}
              >
                Gérer la commande
              </Button>

              <Button
                variant="outlined"
                startIcon={<SupportAgentIcon />}
                onClick={() => alert("Contacter l’acheteur…")}
              >
                Contacter acheteur
              </Button>

              <Button
                variant="outlined"
                startIcon={<ReceiptLongIcon />}
                onClick={() => alert("Téléchargement facture…")}
              >
                Facture
              </Button>
            </Box>
          </Card>
        ))}

        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination count={4} color="primary" size="large" />
        </Box>
      </Box>
    </UserPageLayout>
  );
}
