import FavoriteIcon from "@mui/icons-material/Favorite";
import { Box, Button, Card, Divider, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import UserPageLayout from "../../layout/UserPageLayout";
import type { Article } from "../../types/article.type";

import { useLocation } from "react-router-dom";
import BuyerArticleCard from "../../components/buyer/BuyerArticlecard";
import {
  getFollowingArticles,
  getRecommendedArticles,
} from "../../services/articles.api";

export default function FavoritesPage() {
  const ITEMS_PER_PAGE = 12;

  const [favorites, setFavorites] = useState<Article[]>([]);
  const [recommended, setRecommended] = useState<Article[]>([]);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [loading, setLoading] = useState(true);

  const location = useLocation();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const [favs, recs] = await Promise.all([
          getFollowingArticles(),
          getRecommendedArticles(),
        ]);

        setFavorites(favs);
        setRecommended(recs);
      } catch (error) {
        console.error("Erreur chargement favoris :", error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [location.key]);

  const visibleFavorites = favorites.slice(0, visibleCount);

  return (
    <UserPageLayout>
      <Box
        sx={{
          maxWidth: "1300px",
          mx: "auto",
          px: { xs: 2, md: 3 },
          py: 3,
        }}
      >
        <Box mb={4}>
          <Typography fontSize={{ xs: 28, md: 34 }} fontWeight={900} mb={1}>
            ❤️ Mes Favoris
          </Typography>
          <Typography color="gray">
            Retrouvez ici tous les articles que vous aimez
          </Typography>
        </Box>

        {loading && (
          <Typography align="center" color="gray" mt={4}>
            Chargement de vos favoris...
          </Typography>
        )}

        {!loading && favorites.length === 0 && (
          <Card
            sx={{
              mt: 4,
              p: 5,
              borderRadius: 4,
              textAlign: "center",
              boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
              background: "linear-gradient(135deg, #f9f9ff, #ffffff)",
            }}
          >
            <FavoriteIcon sx={{ fontSize: 70, color: "#e0e0e0" }} />

            <Typography fontSize={22} fontWeight={800} mt={2}>
              Aucun favori pour le moment
            </Typography>

            <Typography color="gray" mt={1}>
              Commencez à explorer et ajoutez vos articles préférés
            </Typography>
          </Card>
        )}

        {!loading && favorites.length > 0 && (
          <>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 3,
                justifyContent: {
                  xs: "center",
                  sm: "flex-start",
                },
              }}
            >
              {visibleFavorites.map((art) => (
                <BuyerArticleCard
                  key={art.id}
                  article={art}
                  onClick={() =>
                    (window.location.href = `/article/detail/${art.id}`)
                  }
                />
              ))}
            </Box>

            {visibleCount < favorites.length && (
              <Box sx={{ textAlign: "center", mt: 5 }}>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: "#1e4fff",
                    px: 5,
                    py: 1.6,
                    fontWeight: 800,
                    borderRadius: 3,
                    "&:hover": { bgcolor: "#163bcc" },
                  }}
                  onClick={() =>
                    setVisibleCount((prev) => prev + ITEMS_PER_PAGE)
                  }
                >
                  Voir plus d’articles
                </Button>
              </Box>
            )}
          </>
        )}

        {!loading && recommended.length > 0 && (
          <>
            <Divider sx={{ my: 7 }} />

            <Box mb={3}>
              <Typography fontSize={{ xs: 24, md: 28 }} fontWeight={900} mb={1}>
                Recommandés pour vous
              </Typography>

              <Typography color="gray">
                Basé sur vos favoris et votre activité récente
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 3,
                justifyContent: {
                  xs: "center",
                  sm: "flex-start",
                },
              }}
            >
              {recommended.slice(0, 8).map((rec) => (
                <BuyerArticleCard
                  key={rec.id}
                  article={rec}
                  onClick={() =>
                    (window.location.href = `/article/detail/${rec.id}`)
                  }
                />
              ))}
            </Box>
          </>
        )}
      </Box>
    </UserPageLayout>
  );
}
