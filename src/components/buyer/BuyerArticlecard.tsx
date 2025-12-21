import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import StarIcon from "@mui/icons-material/Star";
import { Box, Card, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { API_URL } from "../../config";
import { followArticle, unfollowArticle } from "../../services/articles.api";
import type { Article } from "../../types/article.type";

interface BuyerArticleCardProps {
  article: Article;
  onClick: () => void;
}

export default function BuyerArticleCard({
  article,
  onClick,
}: BuyerArticleCardProps) {
  const [isFavorite, setIsFavorite] = useState<boolean>(!!article.isFavorite);
  const [likesCount, setLikesCount] = useState<number>(article.likesCount ?? 0);
  const [loading, setLoading] = useState(false);
  const isSoldOut = (article.quantity ?? 0) <= 0;

  useEffect(() => {
    setIsFavorite(!!article.isFavorite);
    setLikesCount(article.likesCount ?? 0);
  }, [article]);

  const rawUrl = article.images?.[0]?.url;
  const imageUrl = rawUrl
    ? rawUrl.startsWith("http")
      ? rawUrl
      : `${API_URL}${rawUrl}`
    : "/placeholder.png";

  async function handleToggleFavorite(e: React.MouseEvent<HTMLDivElement>) {
    e.stopPropagation();
    if (loading) return;

    setLoading(true);

    try {
      if (isFavorite) {
        await unfollowArticle(article.id);
        setIsFavorite(false);
        setLikesCount((prev) => prev - 1);
      } else {
        await followArticle(article.id);
        setIsFavorite(true);
        setLikesCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Erreur toggle favoris :", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card
      sx={{
        width: 250,
        cursor: "pointer",
        overflow: "hidden",
        background: "transparent",
        boxShadow: "0 2px 10px rgba(0,0,0,0.10)",
        borderRadius: 2,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        transition: "0.22s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 25px rgba(0,0,0,0.18)",
        },
      }}
      onClick={onClick}
    >
      <Box
        sx={{
          position: "absolute",
          top: 10,
          right: 10,
          width: 34,
          height: 34,
          borderRadius: "50%",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 3,
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.5 : 1,
        }}
        onClick={handleToggleFavorite}
      >
        {isFavorite ? (
          <FavoriteIcon sx={{ color: "#FF4F74" }} />
        ) : (
          <FavoriteBorderIcon sx={{ color: "#444" }} />
        )}
      </Box>

      {isSoldOut && (
        <Box
          sx={{
            position: "absolute",
            left: 0,
            top: 0,
            bgcolor: "rgba(0,0,0,0.7)",
            color: "white",
            px: 1.2,
            py: 0.4,
            fontSize: 11,
            fontWeight: 800,
            borderBottomRightRadius: 12,
            zIndex: 2,
          }}
        >
          Indisponible
        </Box>
      )}

      <Box
        sx={{
          height: 160,
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: isSoldOut ? "grayscale(1)" : "none",
          opacity: isSoldOut ? 0.7 : 1,
          transition: "0.2s",
        }}
      />

      <Box sx={{ p: 1.3, display: "flex", flexDirection: "column", gap: 0.7 }}>
        <Typography
          fontWeight={700}
          fontSize={15}
          sx={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {article.title}
        </Typography>

        <Typography
          color="gray"
          fontSize={12}
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {article.description}
        </Typography>

        <Typography
          fontWeight={800}
          sx={{
            mt: 0.5,
            color: isSoldOut ? "gray" : "#4C73FF",
            textDecoration: isSoldOut ? "line-through" : "none",
          }}
        >
          {article.price} €
        </Typography>

        {article?.shipping_cost && (
          <Typography fontSize={11} color="gray">
            Livraison : {article.shipping_cost} €
          </Typography>
        )}

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, mt: 0.3 }}>
          <StarIcon sx={{ fontSize: 15, color: "#FFC107" }} />
          <Typography fontSize={12}>
            {article.avgRating} ({article.ratingsCount})
          </Typography>
        </Box>

        {article.shop && (
          <Box sx={{ mt: 0.5 }}>
            <Typography fontSize={12} fontWeight={700}>
              Boutique : {article.shop.name}
            </Typography>

            <Typography
              fontSize={11}
              color="gray"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {article.shop.description}
            </Typography>
          </Box>
        )}

        {likesCount > 0 && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <FavoriteBorderIcon sx={{ fontSize: 14, color: "#ff4f74" }} />
            <Typography fontSize={12} color="gray">
              {likesCount}
            </Typography>
          </Box>
        )}
        {isSoldOut && (
          <Typography
            fontSize={11}
            color="gray"
            sx={{ mt: 0.3, fontStyle: "italic" }}
          >
            Cet article n’est plus disponible, mais vous pouvez toujours
            consulter sa fiche.
          </Typography>
        )}
      </Box>
    </Card>
  );
}
