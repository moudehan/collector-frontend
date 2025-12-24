import { Box, Card, Container, Divider, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import UserPageLayout from "../../layout/UserPageLayout";

import AnimatedButton from "../../components/Button";
import BuyerArticleCard from "../../components/buyer/BuyerArticlecard";
import { rateShop } from "../../services/shop-ratings.api";
import { getShopById } from "../../services/shop.api";
import type { Shop } from "../../types/shop.type";

const PAGE_SIZE = 15;

export default function ShopDetailPageBuyer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [shop, setShop] = useState<Shop | null>(null);
  const [avgRating, setAvgRating] = useState(0);
  const [ratingsCount, setRatingsCount] = useState(0);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [userRating, setUserRating] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const data = await getShopById(id);
        setShop(data);

        if (typeof data.avgRating === "number") {
          setAvgRating(data.avgRating);
        }
        if (typeof data.ratingsCount === "number") {
          setRatingsCount(data.ratingsCount);
        }
        if (typeof data.userRating === "number") {
          setUserRating(data.userRating);
        }
      } catch (e) {
        console.error("Erreur chargement boutique :", e);
      }
    })();
  }, [id]);

  async function handleRate(value: number) {
    if (!id) return;

    try {
      setUserRating(value);

      const res = await rateShop(id, value);

      setAvgRating(res.avgRating);
      setRatingsCount(res.ratingsCount);
    } catch (e) {
      console.error("Erreur notation boutique :", e);
    }
  }

  const articles = useMemo(() => shop?.articles ?? [], [shop]);

  const visibleArticles = useMemo(
    () => articles.slice(0, visibleCount),
    [articles, visibleCount]
  );

  if (!shop) return null;

  return (
    <UserPageLayout>
      <Container sx={{ maxWidth: 1300, mt: 4 }}>
        <Card
          sx={{
            p: 5,
            mb: 5,
            borderRadius: 5,
            background:
              "linear-gradient(135deg, #0f1fff 0%, #3b63ff 50%, #5d86ff 100%)",
            color: "#fff",
            boxShadow: "0 15px 40px rgba(0,0,0,0.25)",
          }}
        >
          <Typography fontSize={36} fontWeight={1000}>
            {shop.name}
          </Typography>

          <Typography sx={{ mt: 1.5, maxWidth: 600, opacity: 0.9 }}>
            {shop.description}
          </Typography>

          <Typography sx={{ mt: 1, fontSize: 14, opacity: 0.85 }}>
            Boutique tenue par {shop.owner.firstname} {shop.owner.lastname}
          </Typography>
        </Card>

        <Card
          sx={{
            p: 4,
            mb: 6,
            borderRadius: 4,
            boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
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
            Votre évaluation aide les acheteurs à faire leur choix.
          </Typography>

          <Box sx={{ display: "flex", gap: 2 }}>
            {[1, 2, 3, 4, 5].map((value) => {
              const selected = userRating !== null && value <= userRating;

              return (
                <Box
                  key={value}
                  onClick={() => handleRate(value)}
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    border: "2px solid",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 16,
                    cursor: "pointer",
                    transition: "0.2s",

                    background: selected ? "#FFD700" : "#fff",
                    borderColor: selected ? "#FFD700" : "#ddd",
                    color: selected ? "#000" : "#444",

                    "&:hover": {
                      transform: "scale(1.15)",
                      borderColor: "#FFD700",
                    },
                  }}
                >
                  {value}
                </Box>
              );
            })}
          </Box>
        </Card>

        <Box sx={{ mb: 3 }}>
          <Typography fontSize={28} fontWeight={1000}>
            Articles ({articles.length})
          </Typography>
          <Divider sx={{ mt: 1 }} />
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: 3,
            alignItems: "stretch",
          }}
        >
          {visibleArticles.map((article) => (
            <BuyerArticleCard
              key={article.id}
              article={article}
              onClick={() => navigate(`/article/detail/${article.id}`)}
            />
          ))}
        </Box>

        {visibleCount < articles.length && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
            <AnimatedButton
              variant="outlined"
              sx={{ border: 1 }}
              label="Voir plus"
              onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
            />
          </Box>
        )}

        {articles.length === 0 && (
          <Typography color="gray" mt={3}>
            Cette boutique n’a pas encore d’articles.
          </Typography>
        )}
      </Container>
    </UserPageLayout>
  );
}
