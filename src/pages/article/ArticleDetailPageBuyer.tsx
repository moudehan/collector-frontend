import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Box,
  Card,
  Container,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";

import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

import ArticleImageGallery from "../../components/ArticleImageGallery";
import AnimatedButton from "../../components/Button";
import UserPageLayout from "../../layout/UserPageLayout";

import { useCart } from "../../contexte/cart/useCart";
import ArticleInfoSection from "../../layout/ArticleInfoSection";
import { rateArticle } from "../../services/article-ratings.api";
import {
  followArticle,
  getArticleById,
  unfollowArticle,
} from "../../services/articles.api";
import type { Article } from "../../types/article.type";
import type { Shop } from "../../types/shop.type";

export default function ArticleDetailPageBuyer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [article, setArticle] = useState<Article | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFav, setLoadingFav] = useState(false);
  const [avgRating, setAvgRating] = useState(0);
  const [ratingsCount, setRatingsCount] = useState(0);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const isSoldOut = article ? (article.quantity ?? 0) <= 0 : false;

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const data = await getArticleById(id);

        setArticle(data);
        setShop(data.shop);
        setIsFavorite(!!data.isFavorite);
        setAvgRating(data.avgRating ?? 0);
        setRatingsCount(data.ratingsCount ?? 0);
        setUserRating(data.userRating ?? null);
      } catch (e) {
        console.error("Erreur chargement article :", e);
      }
    })();
  }, [id]);

  async function handleToggleFavorite() {
    if (!article || loadingFav) return;

    try {
      setLoadingFav(true);

      if (isFavorite) {
        await unfollowArticle(article.id);
        setIsFavorite(false);
        setArticle((prev) =>
          prev
            ? { ...prev, likesCount: Math.max((prev.likesCount ?? 1) - 1, 0) }
            : prev
        );
      } else {
        await followArticle(article.id);
        setIsFavorite(true);
        setArticle((prev) =>
          prev ? { ...prev, likesCount: (prev.likesCount ?? 0) + 1 } : prev
        );
      }
    } catch (e) {
      console.error("Erreur follow :", e);
    } finally {
      setLoadingFav(false);
    }
  }

  async function handleRate(value: number) {
    if (!article) return;

    try {
      const res = await rateArticle(article.id, value);

      setUserRating(value);
      setAvgRating(res.avgRating);
      setRatingsCount(res.ratingsCount);
    } catch (e) {
      console.error("Erreur notation :", e);
    }
  }

  async function handleAddToCart() {
    if (!article) return;

    try {
      setAddingToCart(true);
      await addItem(article.id, 1);
      navigate("/cart");
    } catch (error) {
      console.error("Erreur ajout au panier :", error);
    } finally {
      setAddingToCart(false);
    }
  }

  if (!article || !shop) return null;

  return (
    <UserPageLayout>
      <Container sx={{ maxWidth: "1100px", pb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIosNewIcon />
          </IconButton>
          <Typography fontSize={18} fontWeight={700} ml={1}>
            Retour
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <Typography fontSize={32} fontWeight={900}>
            {article.title}
          </Typography>

          <Box
            sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            onClick={handleToggleFavorite}
          >
            {isFavorite ? (
              <FavoriteIcon sx={{ color: "#FF4F74", fontSize: 32 }} />
            ) : (
              <FavoriteBorderIcon sx={{ color: "#444", fontSize: 32 }} />
            )}

            <Typography fontWeight={700} ml={1} fontSize={18}>
              {article.likesCount ?? 0}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 3 }}>
          <ArticleImageGallery images={article.images} />

          <Box sx={{ flex: 1 }}>
            <Card sx={{ p: 3, borderRadius: 3 }}>
              <Typography fontWeight={700} fontSize={20}>
                Vendeur : {shop.owner.firstname} {shop.owner.lastname}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography fontSize={18} fontWeight={700}>
                Boutique : {shop.name}
              </Typography>

              <Typography color="gray" fontSize={14} mb={2}>
                {shop.description}
              </Typography>

              <AnimatedButton
                label="Voir la boutique"
                width="100%"
                sx={{ mb: 2 }}
                onClick={() => navigate(`/shop/detail/${shop.id}`)}
              />

              <AnimatedButton
                label="Contacter le vendeur"
                width="100%"
                variant="outlined"
                sx={{ border: 1, mb: 2 }}
                color="green"
                onClick={() => {
                  navigate("/conversations", {
                    state: {
                      articleId: article.id,
                      shopId: shop.id,
                      sellerId: shop.owner.id,
                    },
                  });
                }}
              />

              <AnimatedButton
                label={
                  addingToCart
                    ? "Ajout en cours..."
                    : isSoldOut
                    ? "Article indisponible"
                    : "Acheter"
                }
                startIcon={<ShoppingCartIcon />}
                width="100%"
                variant="outlined"
                sx={{
                  border: 1,
                  mb: 2,
                  ...(isSoldOut && {
                    opacity: 0.6,
                    cursor: "not-allowed",
                  }),
                }}
                disabled={addingToCart || isSoldOut}
                onClick={isSoldOut ? undefined : handleAddToCart}
              />
            </Card>
          </Box>
        </Box>

        <Box
          sx={{
            mt: 5,
            p: 4,
            borderRadius: 4,
            background: "#ffffff",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
          }}
        >
          <Typography fontSize={22} fontWeight={900} mb={2}>
            Avis clients
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Typography fontSize={42} fontWeight={900} color="#FFD700">
              {avgRating.toFixed(1)}
            </Typography>

            <Box>
              <Typography fontWeight={700}>Note moyenne</Typography>
              <Typography color="gray" fontSize={14}>
                Basée sur {ratingsCount} avis
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 0.5, mb: 4 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Box
                key={star}
                sx={{
                  width: 26,
                  height: 26,
                  mask: "url(https://s2.svgbox.net/hero-solid.svg?ic=star) no-repeat center",
                  WebkitMask:
                    "url(https://s2.svgbox.net/hero-solid.svg?ic=star) no-repeat center",
                  backgroundColor: star <= avgRating ? "#FFD700" : "#E0E0E0",
                }}
              />
            ))}
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography fontWeight={900} mb={2}>
            Donner votre avis
          </Typography>

          <Typography color="gray" fontSize={14} mb={2}>
            Votre évaluation aide les autres acheteurs à faire le bon choix.
          </Typography>

          <Box sx={{ display: "flex", gap: 2 }}>
            {[1, 2, 3, 4, 5].map((value) => (
              <Box
                key={value}
                onClick={() => handleRate(value)}
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  border: "2px solid #ddd",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 16,
                  cursor: "pointer",
                  transition: "0.2s",
                  background:
                    userRating !== null
                      ? value <= userRating
                        ? "#4CAF50"
                        : "#fff"
                      : "#fff",
                  borderColor:
                    userRating !== null && value <= userRating
                      ? "#4CAF50"
                      : "#ddd",
                  color: value <= avgRating ? "#000" : "#444",
                  "&:hover": {
                    transform: "scale(1.15)",
                    borderColor: "#FFD700",
                  },
                }}
              >
                {value}
              </Box>
            ))}
          </Box>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography fontSize={22} fontWeight={800} mb={1}>
            Description
          </Typography>
          <Typography sx={{ color: "gray", fontSize: 16, lineHeight: 1.6 }}>
            {article.description}
          </Typography>
        </Box>

        <ArticleInfoSection article={article} />
      </Container>
    </UserPageLayout>
  );
}
