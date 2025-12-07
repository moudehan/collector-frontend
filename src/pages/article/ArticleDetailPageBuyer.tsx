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

import ArticleInfoSection from "../../layout/ArticleInfoSection";
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

  const [article, setArticle] = useState<Article | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFav, setLoadingFav] = useState(false);

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const data = await getArticleById(id);

        setArticle(data);
        setShop(data.shop);
        setIsFavorite(!!data.isFavorite);
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

  if (!article || !shop) return null;

  const ratingFake = 3.7;

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
            <Card
              sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
              }}
            >
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
                onClick={() => navigate(`/shop/${shop.id}`)}
              />

              <AnimatedButton
                label="Contacter le vendeur"
                width="100%"
                variant="outlined"
                sx={{ border: 1, mb: 2 }}
                color="green"
              />

              <AnimatedButton
                label="Acheter"
                startIcon={<ShoppingCartIcon />}
                width="100%"
                variant="outlined"
                sx={{ border: 1, mb: 2 }}
              />
            </Card>
          </Box>
        </Box>

        <Box sx={{ mt: 4, display: "flex", alignItems: "center", gap: 1 }}>
          {[1, 2, 3, 4, 5].map((star) => {
            const filled = ratingFake >= star;
            const half = ratingFake >= star - 0.5 && ratingFake < star;

            return (
              <Box
                key={star}
                sx={{
                  width: 26,
                  height: 26,
                  mask: "url(https://s2.svgbox.net/hero-solid.svg?ic=star) no-repeat center",
                  WebkitMask:
                    "url(https://s2.svgbox.net/hero-solid.svg?ic=star) no-repeat center",
                  backgroundColor: filled || half ? "#FFD700" : "#D1D1D1",
                  ...(half && {
                    background:
                      "linear-gradient(to right, #FFD700 50%, #D1D1D1 50%)",
                  }),
                }}
              />
            );
          })}

          <Typography fontWeight={700} ml={1}>
            {ratingFake.toFixed(1)} / 5
          </Typography>
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
