import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import StarIcon from "@mui/icons-material/Star";
import { Box, Card, Typography } from "@mui/material";
import { API_URL } from "../../config";
import type { Article } from "../../types/article.type";

interface PublicArticlesCardProps {
  article: Article;
  onClick: () => void;
  onRequireAuth: () => void;
}

export default function PublicArticlesCard({
  article,
  onClick,
  onRequireAuth,
}: PublicArticlesCardProps) {
  const imageUrl = article.images?.[0]?.url?.startsWith("http")
    ? article.images[0].url
    : `${API_URL}${article.images?.[0]?.url || ""}`;

  return (
    <Card
      data-testid="public-article-card"
      sx={{
        width: 250,
        cursor: "pointer",
        overflow: "hidden",
        borderRadius: 2,
        boxShadow: "0 2px 10px rgba(0,0,0,0.10)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
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
          zIndex: 3,
          width: 34,
          height: 34,
          borderRadius: "50%",
          background: "#fff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          cursor: "pointer",
        }}
        onClick={(e) => {
          e.stopPropagation();
          onRequireAuth();
        }}
      >
        <FavoriteBorderIcon sx={{ color: "#444" }} />
      </Box>

      <Box
        sx={{
          height: 160,
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <Box sx={{ p: 1.3, display: "flex", flexDirection: "column", gap: 0.6 }}>
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

        <Typography fontWeight={800} color="#4C73FF" sx={{ mt: 0.5 }}>
          {article.price} €
        </Typography>

        {article.shipping_cost && (
          <Typography fontSize={11} color="gray">
            Livraison : {article.shipping_cost} €
          </Typography>
        )}

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

            <Box
              sx={{ display: "flex", alignItems: "center", gap: 0.4, mt: 0.3 }}
            >
              <StarIcon sx={{ fontSize: 15, color: "#FFC107" }} />
              <Typography fontSize={12}>
                {article.shop.avgRating} ({article.shop.ratingsCount})
              </Typography>
            </Box>

            {article.likesCount > 0 && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <FavoriteBorderIcon sx={{ fontSize: 14, color: "#ff4f74" }} />
                <Typography fontSize={12} color="gray">
                  {article.likesCount}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Card>
  );
}
