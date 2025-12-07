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
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ReplayIcon from "@mui/icons-material/Replay";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";

import UserPageLayout from "../../layout/UserPageLayout";

export default function PurchaseHistory() {
  const purchases = [
    {
      id: 1,
      title: "Sneakers Limited Red Edition",
      price: 129,
      date: "12 Jan 2025",
      status: "Livré",
      image:
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=400",
    },
    {
      id: 2,
      title: "Vintage Hoodie",
      price: 59,
      date: "03 Jan 2025",
      status: "En cours",
      image:
        "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=400",
    },
  ];

  return (
    <UserPageLayout>
      <Box sx={{ maxWidth: 900, mx: "auto", p: 3 }}>
        <Typography fontSize={28} fontWeight={900} mb={3}>
          Historique d’achats
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
            <MenuItem value="done">Livré</MenuItem>
            <MenuItem value="pending">En cours</MenuItem>
            <MenuItem value="returned">Retourné</MenuItem>
          </Select>
        </Card>

        {purchases.map((p) => (
          <Card
            key={p.id}
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
                src={p.image}
                sx={{ width: 90, height: 90, borderRadius: 2 }}
              />

              <Box sx={{ flexGrow: 1 }}>
                <Typography fontSize={18} fontWeight={800}>
                  {p.title}
                </Typography>
                <Typography color="gray" fontSize={14}>
                  {p.price} € — acheté le {p.date}
                </Typography>

                <Chip
                  label={p.status}
                  color={p.status === "Livré" ? "success" : "warning"}
                  sx={{ mt: 1, fontWeight: 700 }}
                />
              </Box>

              <Button
                onClick={() => (window.location.href = `/articles/${p.id}`)}
                endIcon={<ArrowForwardIosIcon />}
                sx={{ whiteSpace: "nowrap" }}
              >
                Voir l’article
              </Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Button
                variant="outlined"
                startIcon={<ReceiptLongIcon />}
                onClick={() => alert("Téléchargement de la facture…")}
              >
                Télécharger facture
              </Button>

              <Button
                variant="outlined"
                startIcon={<SupportAgentIcon />}
                onClick={() => alert("Contacter le vendeur…")}
              >
                Contacter vendeur
              </Button>

              <Button
                variant="contained"
                startIcon={<ReplayIcon />}
                sx={{ bgcolor: "#0047FF" }}
                onClick={() =>
                  alert("Ajout au panier pour racheter cet article…")
                }
              >
                Racheter
              </Button>
            </Box>
          </Card>
        ))}

        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination count={5} color="primary" size="large" />
        </Box>
      </Box>
    </UserPageLayout>
  );
}
