import { Box, Container, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import AnimatedButton from "../components/Button";
import UserPageLayout from "../layout/UserPageLayout";

import {
  fetchArticlesByCategory,
  fetchPrivateArticles,
} from "../services/articles.api";
import { fetchPublicCategories } from "../services/categories.api";

import StorefrontIcon from "@mui/icons-material/Storefront";
import ArticleCardList from "../layout/ArticleCardList";
import CategoryButtonList from "../layout/CategoryButtonList";

import { useLocation, useNavigate } from "react-router-dom";
import BuyerArticleCard from "../components/buyer/BuyerArticlecard";
import type { Article, Category } from "../types/article.type";

export default function UserHome() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAll, setShowAll] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [categoryArticles, setCategoryArticles] = useState<Article[]>([]);

  const location = useLocation();

  const navigate = useNavigate();
  useEffect(() => {
    async function load() {
      try {
        const [articlesData, categoriesData] = await Promise.all([
          fetchPrivateArticles(),
          fetchPublicCategories(),
        ]);

        setArticles(articlesData);
        setCategories(categoriesData);
      } catch (e) {
        console.error("Erreur rechargement Home :", e);
      }
    }
    load();
  }, [location.key]);

  async function handleCategoryClick(cat: Category) {
    setSelectedCategory(cat);
    try {
      const filtered = await fetchArticlesByCategory(cat.id);
      setCategoryArticles(filtered);
    } catch (e) {
      console.error(e);
    }
  }
  return (
    <UserPageLayout>
      <Box
        sx={{
          backgroundColor: "#f1f3f8",
          color: "#2d2d2d",
          py: 2,
          textAlign: "center",
          borderRadius: 4,
          mb: 6,
          px: 3,
          position: "relative",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.5)",
            filter: "blur(20px)",
          }}
        />

        <Box
          sx={{
            position: "absolute",
            bottom: -30,
            left: -30,
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.4)",
            filter: "blur(25px)",
          }}
        />

        <Typography fontSize={36} fontWeight={900}>
          Lancez votre boutique sur Collector 🛍️
        </Typography>

        <Typography
          fontSize={18}
          mt={2}
          sx={{ maxWidth: 650, mx: "auto", mb: 3 }}
          color="rgba(0,0,0,0.7)"
        >
          Devenez vendeur et partagez vos objets de collection avec des milliers
          d’acheteurs passionnés. Commencez gratuitement.
        </Typography>

        <AnimatedButton
          label="Créer une boutique"
          startIcon={<StorefrontIcon />}
          width="auto"
          center
          sx={{ px: 3 }}
          onClick={() => (window.location.href = "/ShopManagement")}
        />
      </Box>

      <Container>
        <Box
          mb={3}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h5" fontWeight={700}>
            Parcourir par catégorie
          </Typography>

          <AnimatedButton
            variant="text"
            label={showAll ? "Voir moins" : "Voir tout"}
            onClick={() => setShowAll(!showAll)}
            width="auto"
          />
        </Box>

        <CategoryButtonList
          categories={categories}
          showAll={showAll}
          limit={6}
          onClick={handleCategoryClick}
        />

        {selectedCategory && (
          <Container sx={{ pb: 12, mt: 6 }}>
            <Typography variant="h5" fontWeight={700} mb={3}>
              Articles : {selectedCategory.name}
            </Typography>

            <ArticleCardList articles={categoryArticles} />
          </Container>
        )}

        <Typography variant="h5" fontWeight={700} mt={3} mb={2}>
          Derniers articles publiés
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 3,
            flexWrap: "wrap",
          }}
        >
          {articles.map((art) => (
            <BuyerArticleCard
              key={art.id}
              article={art}
              onClick={() => navigate(`/article/detail/${art.id}`)}
            />
          ))}
        </Box>
      </Container>
    </UserPageLayout>
  );
}
