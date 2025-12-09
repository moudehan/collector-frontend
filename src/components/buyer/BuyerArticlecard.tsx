import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
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

  useEffect(() => {
    setIsFavorite(!!article.isFavorite);
    setLikesCount(article.likesCount ?? 0);
  }, [article.id, article.isFavorite, article.likesCount]);

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
        setLikesCount((prev) => Math.max(prev - 1, 0));
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
        width: 220,
        height: 330,
        cursor: "pointer",
        overflow: "hidden",
        background: "transparent",
        boxShadow: "none",
        borderRadius: 2,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        transition: "0.22s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 25px rgba(0,0,0,0.12)",
        },
      }}
      onClick={onClick}
    >
      <Box
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2,
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.6 : 1,
        }}
        onClick={handleToggleFavorite}
      >
        {isFavorite ? (
          <FavoriteIcon sx={{ color: "#FF4F74", fontSize: 20 }} />
        ) : (
          <FavoriteBorderIcon sx={{ color: "#444", fontSize: 20 }} />
        )}
      </Box>

      <Box
        sx={{
          height: 160,
          minHeight: 160,
          maxHeight: 160,
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: "8px",
        }}
      />

      <Box
        sx={{
          p: 1,
          background: "transparent",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography
          fontWeight={700}
          fontSize={14}
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
            mt: 0.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {article.description}
        </Typography>

        <Box>
          <Typography
            fontWeight={800}
            color="#4C73FF"
            sx={{ mt: 1, fontSize: 16 }}
          >
            {article.price} €
          </Typography>

          {likesCount > 0 && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <FavoriteBorderIcon sx={{ fontSize: 14, color: "#ff4f74" }} />
              <Typography fontSize={12} color="gray">
                {likesCount}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Card>
  );
}
