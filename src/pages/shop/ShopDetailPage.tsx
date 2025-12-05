import AddIcon from "@mui/icons-material/Add";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { Box, Container, Typography } from "@mui/material";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AnimatedButton from "../../components/Button";
import UserPageLayout from "../../layout/UserPageLayout";

import SellerArticleCard from "../../components/seller/SellerArticleCard";
import { getShopById } from "../../services/shop.api";
import type { Shop } from "../../types/shop.type";

export default function ShopDetailPage() {
  const { id: shopId } = useParams();
  const navigate = useNavigate();

  const [shop, setShop] = useState<Shop>();
  const [visibleCount, setVisibleCount] = useState(15);

  useEffect(() => {
    async function loadShop() {
      if (!shopId) return;

      try {
        const shopData = await getShopById(shopId);
        setShop(shopData);
      } catch (e) {
        console.error("Erreur chargement boutique :", e);
      }
    }

    loadShop();
  }, [shopId]);

  if (!shop) return null;

  const displayedArticles = shop.articles.slice(0, visibleCount);

  return (
    <UserPageLayout>
      <Container sx={{ py: 4, maxWidth: "1300px" }}>
        <Box
          sx={{
            backgroundSize: "cover",
            backgroundPosition: "center",
            py: 8,
            px: 4,
            borderRadius: 4,
            position: "relative",
            mb: 6,
            color: "#fff",
            textShadow: "0px 3px 6px rgba(0,0,0,0.4)",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              borderRadius: 4,
            }}
          />

          <Box sx={{ position: "relative", textAlign: "center" }}>
            <StorefrontIcon sx={{ fontSize: 70 }} />
            <Typography fontSize={42} fontWeight={900} mt={2}>
              {shop.name}
            </Typography>
            <Typography fontSize={18}>{shop.description}</Typography>
          </Box>
        </Box>

        <Box sx={{ textAlign: "right", mb: 3 }}>
          <AnimatedButton
            label="Ajouter un article"
            startIcon={<AddIcon />}
            width="auto"
            sx={{ px: 3 }}
            onClick={() => navigate(`/shop/${shop.id}/article/add`)}
          />
        </Box>

        <Typography variant="h5" fontWeight={800} mb={3}>
          Articles ({shop.articles.length})
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 3,
          }}
        >
          {displayedArticles.map((art) => (
            <SellerArticleCard
              key={art.id}
              article={art}
              onClick={() => navigate(`/article/${art.id}`)}
            />
          ))}
        </Box>

        {visibleCount < shop.articles.length && (
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <AnimatedButton
              label="Voir plus"
              width="200px"
              center
              onClick={() => setVisibleCount((prev) => prev + 15)}
            />
          </Box>
        )}
      </Container>
    </UserPageLayout>
  );
}
