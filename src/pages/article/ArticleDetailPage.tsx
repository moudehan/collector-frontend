import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Alert,
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
import {
  deleteArticle,
  getArticleById,
  updateArticle,
} from "../../services/articles.api";
import ArticleEditModal from "./ArticleEditModal";

import type {
  Article,
  Category,
  UpdatedArticlePayload,
} from "../../types/article.type";
import type { Shop } from "../../types/shop.type";

import BugReportIcon from "@mui/icons-material/BugReport";
import CategoryIcon from "@mui/icons-material/Category";
import DateRangeIcon from "@mui/icons-material/DateRange";
import FavoriteIcon from "@mui/icons-material/Favorite";
import InfoIcon from "@mui/icons-material/Info";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import TagIcon from "@mui/icons-material/Tag";
import { fetchPublicCategories } from "../../services/categories.api";
const API_URL = import.meta.env.VITE_API_URL;

function InfoLine({ label, value }: { label: string; value: string | number }) {
  const getIcon = () => {
    const key = label.toLowerCase();

    if (key.includes("id")) return <TagIcon sx={{ color: "#1976d2" }} />;
    if (key.includes("catégorie"))
      return <CategoryIcon sx={{ color: "#1976d2" }} />;
    if (key.includes("prix"))
      return <LocalOfferIcon sx={{ color: "#1976d2" }} />;
    if (key.includes("livraison"))
      return <LocalShippingIcon sx={{ color: "#1976d2" }} />;
    if (key.includes("créé"))
      return <DateRangeIcon sx={{ color: "#1976d2" }} />;
    if (key.includes("mis à jour"))
      return <DateRangeIcon sx={{ color: "#1976d2" }} />;
    if (key.includes("likes"))
      return <FavoriteIcon sx={{ color: "#1976d2" }} />;
    if (key.includes("anomalie"))
      return <BugReportIcon sx={{ color: "#1976d2" }} />;
    if (key.includes("note")) return <StarHalfIcon sx={{ color: "#fbc02d" }} />;

    return <InfoIcon sx={{ color: "#1976d2" }} />;
  };

  return (
    <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
      <Box sx={{ mt: "3px" }}>{getIcon()}</Box>
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#444" }}>
          {label}
        </Typography>

        <Typography sx={{ color: "#555", fontSize: 15 }}>
          {value ?? "—"}
        </Typography>

        <Divider sx={{ mt: 1 }} />
      </Box>
    </Box>
  );
}

export default function ArticleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [article, setArticle] = useState<Article | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

  useEffect(() => {
    async function loadArticle() {
      if (!id) return;

      try {
        const data = await getArticleById(id);

        const fixedImages =
          data.images?.map((img: { url: string }) => ({
            ...img,
            url: img.url.startsWith("http") ? img.url : `${API_URL}${img.url}`,
          })) ?? [];

        setArticle({ ...data, images: fixedImages });
        setShop(data.shop);
      } catch (err) {
        console.error("Erreur chargement article :", err);
      }
    }

    loadArticle();
  }, [id]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await fetchPublicCategories();
        setCategories(data);
      } catch (err) {
        console.error("Erreur chargement catégories :", err);
      }
    }

    loadCategories();
  }, []);

  const normalizedStatus = useMemo(() => {
    const raw = String(article?.status ?? "");
    return raw.toUpperCase();
  }, [article?.status]);

  const isPending = normalizedStatus === "PENDING";
  const isRejected = normalizedStatus === "REJECTED";

  const cardStyle = useMemo(() => {
    if (isPending) {
      return {
        backgroundColor: "#FFF6D1",
        border: "1px solid #E8C979",
      };
    }
    if (isRejected) {
      return {
        backgroundColor: "#FFE5E5",
        border: "1px solid #F2A3A3",
      };
    }
    return {
      backgroundColor: "white",
      border: "1px solid transparent",
    };
  }, [isPending, isRejected]);

  const statusBadge = useMemo(() => {
    if (isPending) {
      return {
        text: "En attente d’approbation",
        bgcolor: "#FFD86B",
        color: "#8A5A00",
      };
    }
    if (isRejected) {
      return {
        text: "Article rejeté",
        bgcolor: "#FFBDBD",
        color: "#8A1F1F",
      };
    }
    return {
      text: "Article approuvé",
      bgcolor: "#B7FFD1",
      color: "#0F7A26",
    };
  }, [isPending, isRejected]);

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

  async function handleUpdate(payload: UpdatedArticlePayload) {
    if (!article) return;

    const formData = new FormData();
    formData.append("title", payload.title);
    formData.append("description", payload.description);
    formData.append("price", String(payload.price));
    formData.append(
      "shipping_cost",
      String(payload.shipping_cost ?? article.shipping_cost ?? 0)
    );
    formData.append("shopId", payload.shopId);

    if (payload.categoryId) {
      formData.append("categoryId", payload.categoryId);
    }

    if (payload.quantity !== undefined) {
      formData.append("quantity", String(payload.quantity));
    }
    if (payload.vintageEra) {
      formData.append("vintageEra", payload.vintageEra);
    }
    if (payload.productionYear !== undefined) {
      formData.append("productionYear", String(payload.productionYear));
    }
    if (payload.conditionLabel) {
      formData.append("conditionLabel", payload.conditionLabel);
    }
    if (payload.vintageNotes) {
      formData.append("vintageNotes", payload.vintageNotes);
    }

    formData.append("oldImages", JSON.stringify(payload.oldImages));
    payload.newImages.forEach((file: File) => {
      formData.append("newImages", file);
    });

    const updated = await updateArticle(article.id, formData);

    const fixedImages =
      updated.images?.map((img: { url: string }) => ({
        ...img,
        url: img.url.startsWith("http") ? img.url : `${API_URL}${img.url}`,
      })) ?? [];

    setArticle({ ...updated, images: fixedImages });
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

        <Card
          sx={{
            p: 3,
            borderRadius: 3,
            boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
            mb: 4,
            ...cardStyle,
          }}
        >
          <Box sx={{ display: "flex", gap: 3 }}>
            <ArticleImageGallery images={article.images} />

            <Box sx={{ flex: 1 }}>
              <Box sx={{ mb: 1 }}>
                <Box
                  sx={{
                    display: "inline-block",
                    px: 2,
                    py: 0.6,
                    borderRadius: 2,
                    bgcolor: statusBadge.bgcolor,
                    color: statusBadge.color,
                    fontWeight: 800,
                    fontSize: 14,
                  }}
                >
                  {statusBadge.text}
                </Box>
              </Box>

              {isRejected && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  <b>Article rejeté.</b>
                  <br />
                  {article.rejection_reason
                    ? `Raison : ${article.rejection_reason}`
                    : "Raison non précisée."}
                </Alert>
              )}

              {isPending && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  <b>En attente de validation.</b>
                  {Array.isArray(article.moderation_reasons) &&
                    article.moderation_reasons.length > 0 && (
                      <>
                        <br />
                        Raisons :
                        <ul style={{ marginTop: 6, marginBottom: 0 }}>
                          {article.moderation_reasons.map((r, idx) => (
                            <li key={idx}>{r}</li>
                          ))}
                        </ul>
                      </>
                    )}
                </Alert>
              )}

              <Typography fontSize={32} fontWeight={900} mt={2}>
                {article.price} €
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography fontSize={22} fontWeight={700} mb={1}>
                {article.title}
              </Typography>

              <Typography color="gray" sx={{ whiteSpace: "pre-line" }}>
                {article.description}
              </Typography>

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

                  <Typography color="gray" fontSize={14} mt={1}>
                    Vendeur : {shop.owner?.email}
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
                  disabled={isPending}
                  onClick={() => setOpenEdit(true)}
                />

                <AnimatedButton
                  label="Supprimer"
                  startIcon={<DeleteIcon />}
                  variant="outlined"
                  color="red"
                  width="100%"
                  sx={{ border: 1 }}
                  disabled={isPending}
                  onClick={() => setOpenDeleteConfirm(true)}
                />
              </Box>
            </Box>
          </Box>
        </Card>

        <Card
          sx={{
            p: 3,
            borderRadius: 3,
            boxShadow: "0px 4px 15px rgba(0,0,0,0.08)",
          }}
        >
          <Typography fontSize={22} fontWeight={800} mb={3}>
            Informations détaillées
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              rowGap: 2,
              columnGap: 4,
            }}
          >
            <InfoLine label="ID" value={article.id} />
            <InfoLine label="Catégorie" value={article.category?.name} />
            <InfoLine label="Prix" value={`${article.price} €`} />
            <InfoLine
              label="Frais de livraison"
              value={`${article.shipping_cost} €`}
            />

            <InfoLine
              label="Quantité disponible"
              value={article.quantity ?? 0}
            />

            <InfoLine
              label="Époque"
              value={article.vintageEra ?? "Non précisée"}
            />

            <InfoLine
              label="Année de production"
              value={
                article.productionYear !== undefined &&
                article.productionYear !== null
                  ? article.productionYear
                  : "Non renseignée"
              }
            />

            <InfoLine
              label="État"
              value={article.conditionLabel ?? "Non renseigné"}
            />

            <InfoLine
              label="Détails vintage"
              value={article.vintageNotes ?? "—"}
            />

            <InfoLine
              label="Créé le"
              value={new Date(article.created_at).toLocaleString()}
            />
            <InfoLine
              label="Mis à jour le"
              value={new Date(article.updated_at).toLocaleString()}
            />
            <InfoLine label="Likes" value={article.likesCount} />
            <InfoLine
              label="Alertes d'anomalie"
              value={article.fraud_alerts?.length ?? 0}
            />
            <InfoLine
              label="Note moyenne"
              value={`${article.avgRating ?? 0} / 5`}
            />
          </Box>

          {article.seller?.id === shop?.owner?.id && (
            <Typography color="gray" fontSize={13} mt={2}>
              Vous êtes le vendeur : vous ne pouvez pas aimer ou noter votre
              propre article.
            </Typography>
          )}
        </Card>

        <ArticleEditModal
          open={openEdit}
          onClose={() => setOpenEdit(false)}
          article={article}
          categories={categories}
          onSave={handleUpdate}
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
