import { Card, CardContent, CardMedia, Grid, Typography } from "@mui/material";
import { API_URL } from "../config";
import type { Article } from "../types/article.type";

interface Props {
  articles: Article[];
}

export default function ArticleCardList({ articles }: Props) {
  if (!articles || articles.length === 0) {
    return <Typography>Aucun article disponible.</Typography>;
  }

  return (
    <Grid container spacing={6}>
      {articles.map((article) => (
        <Grid key={article.id}>
          <Card
            sx={{
              width: 250,
              height: 310,
              borderRadius: 2,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <CardMedia
              component="img"
              image={
                article.images?.length > 0
                  ? `${API_URL}${article.images[0].url}`
                  : "/img/placeholder.jpg"
              }
              sx={{ height: 180, objectFit: "cover" }}
            />

            <CardContent>
              <Typography fontWeight={600}>{article.title}</Typography>
              <Typography>{article.price} €</Typography>
              <Typography fontSize={13} color="gray">
                par {article.seller?.email ?? "inconnu"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
