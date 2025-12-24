import { Box, Card, Typography } from "@mui/material";
import type { Article } from "../../types/article.type";
const API_URL = import.meta.env.VITE_API_URL;

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
        width: 250,
        cursor: "pointer",
        overflow: "hidden",
        borderRadius: 2,
        boxShadow: "0 2px 10px rgba(0,0,0,0.10)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        backgroundColor: "#fff",
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
          height: 160,
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <Box
        sx={{
          p: 1.3,
          display: "flex",
          flexDirection: "column",
          gap: 0.6,
        }}
      >
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
          color="#4C73FF"
          sx={{ mt: 0.5, fontSize: 16 }}
        >
          {article.price} €
        </Typography>
      </Box>
    </Card>
  );
}
