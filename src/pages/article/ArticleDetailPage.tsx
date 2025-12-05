import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Box,
  Card,
  Container,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";

import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import AnimatedButton from "../../components/Button";
import UserPageLayout from "../../layout/UserPageLayout";

import ArticleImageGallery from "../../components/ArticleImageGallery";
import ModalDeleteConfirm from "../../components/ModaleDeleteConfirm";
import ArticleEditModal from "./ArticleEditModal";

import { API_URL } from "../../config";
import { deleteArticle, getArticleById } from "../../services/articles.api";
import type { Article, Category } from "../../types/article.type";
import type { Shop } from "../../types/shop.type";

export default function ArticleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [article, setArticle] = useState<Article | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [categories] = useState<Category[]>([]);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

  useEffect(() => {
    async function loadArticle() {
      if (!id) return;

      try {
        const data = await getArticleById(id);

        const fixedImages = data.images?.map((img: { url: string }) => ({
          ...img,
          url: img.url.startsWith("http") ? img.url : `${API_URL}${img.url}`,
        }));

        setArticle({ ...data, images: fixedImages });
        setShop(data.shop);
      } catch (err) {
        console.error("Erreur chargement article :", err);
      }
    }

    loadArticle();
  }, [id]);

  if (!article) return null;

  async function handleDeleteArticle() {
    try {
      if (!article?.id) return;
      await deleteArticle(article.id);

      setOpenDeleteConfirm(false);
      navigate(`/shop/${shop?.id}`);
    } catch (e) {
      console.error("Erreur suppression :", e);
    }
  }

  return (
    <UserPageLayout>
      <Container sx={{ maxWidth: "1100px" }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIosNewIcon />
          </IconButton>
          <Typography fontSize={18} fontWeight={700} ml={1}>
            Retour
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 3 }}>
          <ArticleImageGallery images={article.images} />

          <Box sx={{ flex: 1 }}>
            <Card
              sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
              }}
            >
              <Typography fontSize={28} fontWeight={900}>
                {article.price} €
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography fontSize={20} fontWeight={700} mb={1}>
                {article.title}
              </Typography>

              <Typography color="gray">{article.description}</Typography>

              <Divider sx={{ my: 3 }} />

              {shop && (
                <Card
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    backgroundColor: "#f4f6ff",
                    boxShadow: "0 0 10px rgba(0,0,0,0.05)",
                  }}
                >
                  <Typography fontWeight={700} fontSize={18}>
                    Boutique : {shop.name}
                  </Typography>

                  <Typography color="gray" fontSize={14}>
                    {shop.description}
                  </Typography>

                  <AnimatedButton
                    label="Voir la boutique"
                    width="100%"
                    sx={{ mt: 2 }}
                    onClick={() => navigate(`/shop/${shop.id}`)}
                  />
                </Card>
              )}

              <Box sx={{ display: "flex", gap: 1, mt: 3 }}>
                <AnimatedButton
                  label="Modifier"
                  startIcon={<EditIcon />}
                  variant="outlined"
                  width="100%"
                  sx={{ border: 1 }}
                  onClick={() => setOpenEdit(true)}
                />

                <AnimatedButton
                  label="Supprimer"
                  startIcon={<DeleteIcon />}
                  variant="outlined"
                  color="red"
                  width="100%"
                  sx={{ border: 1 }}
                  onClick={() => setOpenDeleteConfirm(true)}
                />
              </Box>
            </Card>
          </Box>
        </Box>

        <ArticleEditModal
          open={openEdit}
          onClose={() => setOpenEdit(false)}
          article={article}
          categories={categories}
          onSave={() => setOpenEdit(false)}
        />

        <ModalDeleteConfirm
          open={openDeleteConfirm}
          label={article.title}
          onClose={() => setOpenDeleteConfirm(false)}
          onConfirm={handleDeleteArticle}
        />
      </Container>
    </UserPageLayout>
  );
}
