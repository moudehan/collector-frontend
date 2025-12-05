import { Box, Card, Typography } from "@mui/material";
import { API_URL } from "../../config";
import type { Article } from "../../types/article.type";

interface Props {
  article: Article;
  onClick: () => void;
}

export default function SellerArticleCard({ article, onClick }: Props) {
  const rawUrl = article.images?.[0]?.url;

  const imageUrl = rawUrl
    ? rawUrl.startsWith("http")
      ? rawUrl
      : `${API_URL}${rawUrl}`
    : "/placeholder.png";

  return (
    <Card
      sx={{
        cursor: "pointer",
        overflow: "hidden",
        background: "transparent",
        boxShadow: "none",
        borderRadius: 2,
        position: "relative",
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
          height: 160,
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: "8px",
        }}
      />

      <Box sx={{ p: 1 }}>
        <Typography fontWeight={700} fontSize={14}>
          {article.title}
        </Typography>

        <Typography color="gray" fontSize={12} sx={{ mt: 0.5 }}>
          {article.description}
        </Typography>

        <Typography
          fontWeight={800}
          color="#4C73FF"
          sx={{ mt: 1, fontSize: 16 }}
        >
          {article.price} €
        </Typography>
      </Box>
    </Card>
  );
}
