import { Grid } from "@mui/material";
import AnimatedButton from "../components/Button";
import type { Category } from "../types/article.type";

interface Props {
  categories: Category[];
  showAll?: boolean;
  limit?: number;
  onClick: (cat: Category) => void;
}

export default function CategoryButtonList({
  categories,
  showAll = false,
  limit = 6,
  onClick,
}: Props) {
  const list = showAll ? categories : categories.slice(0, limit);

  return (
    <Grid
      data-testid="category-button"
      container
      spacing={2}
      justifyContent="center"
    >
      {list.map((cat) => (
        <Grid key={cat.id}>
          <AnimatedButton
            data-testid={`category-button-${cat.id}`}
            variant="outlined"
            sx={{ border: 1 }}
            label={cat.name}
            onClick={() => onClick(cat)}
          />
        </Grid>
      ))}
    </Grid>
  );
}
