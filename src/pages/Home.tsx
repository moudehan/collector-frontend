import { Box, Container, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import AppNavbar from "../components/AppNavBar";
import AnimatedButton from "../components/Button";

import {
  fetchArticlesByCategory,
  fetchPublicArticles,
} from "../services/articles.api";
import { fetchPublicCategories } from "../services/categories.api";

import PublicArticlesCard from "../components/public/PublicArticleCard";
import CategoryButtonList from "../layout/CategoryButtonList";
import type { Article, Category } from "../types/article.type";
import AuthModal from "./AuthModal";

export default function Home() {
  const [showAll, setShowAll] = useState(false);
  const [openAuth, setOpenAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [categoryArticles, setCategoryArticles] = useState<Article[]>([]);

  useEffect(() => {
    async function load() {
      try {
        setArticles(await fetchPublicArticles());
        setCategories(await fetchPublicCategories());
      } catch (err) {
        console.error("Erreur chargement :", err);
      }
    }
    load();
  }, []);

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
    <Box sx={{ bgcolor: "#fff", minHeight: "100vh" }}>
      <AppNavbar />
      <Container sx={{ textAlign: "center", py: 10 }}>
        <Typography variant="h3" fontWeight={700} mb={2}>
          Achetez et vendez des objets de collection
        </Typography>
        <Typography
          variant="h6"
          color="gray"
          sx={{ maxWidth: 550, mx: "auto", mb: 4 }}
        >
          Collector est la place de marché idéale pour acheter ou vendre des
          objets uniques.
        </Typography>
        <AnimatedButton
          center
          label="S'inscrire"
          onClick={() => {
            setAuthMode("register");
            setOpenAuth(true);
          }}
        />
      </Container>
      <Container sx={{ pb: 8 }}>
        <Typography variant="h5" fontWeight={700} mb={3}>
          Derniers articles publiés
        </Typography>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          {articles.map((article) => (
            <PublicArticlesCard
              key={article.id}
              article={article}
              onRequireAuth={() => setOpenAuth(true)}
              onClick={() => console.log("Go article", article.id)}
            />
          ))}
        </Box>
      </Container>
      <Container sx={{ pb: 6 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Typography variant="h5" fontWeight={700}>
            Parcourir par catégorie
          </Typography>

          <AnimatedButton
            label={showAll ? "Voir moins" : "Voir tout"}
            variant="text"
            onClick={() => setShowAll(!showAll)}
          />
        </Box>

        <CategoryButtonList
          categories={categories}
          showAll={showAll}
          limit={6}
          onClick={handleCategoryClick}
        />
      </Container>

      {selectedCategory && (
        <Container sx={{ pb: 12 }}>
          <Typography variant="h5" fontWeight={700} mb={3}>
            Articles : {selectedCategory.name}
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            {categoryArticles.map((article) => (
              <PublicArticlesCard
                key={article.id}
                article={article}
                onRequireAuth={() => setOpenAuth(true)}
                onClick={() => console.log("Go article", article.id)}
              />
            ))}
          </Box>
        </Container>
      )}

      <AuthModal
        open={openAuth}
        onClose={() => setOpenAuth(false)}
        mode={authMode}
        setMode={setAuthMode}
      />
    </Box>
  );
}
