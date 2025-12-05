import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Autocomplete,
  Box,
  Card,
  Container,
  Divider,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";

import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";

import AnimatedButton from "../../components/Button";
import UserPageLayout from "../../layout/UserPageLayout";

import { createArticle } from "../../services/articles.api";
import { fetchPublicCategories } from "../../services/categories.api";
import type { Category } from "../../types/article.type";

export default function ArticleAddPage() {
  const { shopId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [shippingCost, setShippingCost] = useState<number | "">("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  const [images, setImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchPublicCategories()
      .then(setCategories)
      .catch(() => {
        setErrorMessage("Impossible de charger les catégories.");
      });
  }, []);

  console.log({ shopId });
  function handleSelectImages(e: React.ChangeEvent<HTMLInputElement>) {
    const newFiles = e.target.files ? Array.from(e.target.files) : [];
    if (newFiles.length === 0) return;

    const deduped = newFiles.filter(
      (file) =>
        !images.some((img) => img.name === file.name && img.size === file.size)
    );
    const total = images.length + deduped.length;

    if (total > 10) {
      setErrorMessage("Vous pouvez ajouter maximum 10 images.");
      return;
    }

    const updatedFiles = [...images, ...newFiles];
    setImages(updatedFiles);

    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
    setPreviewImages((prev) => [...prev, ...newPreviews]);
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    setErrorMessage("");

    if (!title || !price || !selectedCategory || images.length === 0) {
      setErrorMessage("Merci de remplir tous les champs obligatoires.");
      return;
    }

    if (!shopId) {
      setErrorMessage("Impossible d'associer l’article à une boutique.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("price", String(price));
    formData.append("description", description);
    formData.append("shipping_cost", String(shippingCost));
    formData.append("categoryId", selectedCategory.id);
    formData.append("shopId", shopId!);

    images.forEach((img) => formData.append("images", img));

    try {
      await createArticle(formData);
      navigate(`/shop/${shopId}`);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setErrorMessage("Erreur lors de la création de l’article.");
    }
  }

  return (
    <UserPageLayout>
      <Container sx={{ py: 4, maxWidth: "900px" }}>
        {/* RETOUR */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIosNewIcon />
          </IconButton>
          <Typography fontSize={18} fontWeight={700} ml={1}>
            Retour
          </Typography>
        </Box>

        <Typography fontSize={32} fontWeight={900} mb={3}>
          Ajouter un nouvel article
        </Typography>

        <Card
          sx={{
            p: 3,
            borderRadius: 3,
            boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
          }}
        >
          <Typography fontWeight={700} fontSize={18} mb={1}>
            Images de l’article
          </Typography>

          <Box
            sx={{
              border: "2px dashed #4C73FF",
              borderRadius: 3,
              p: 3,
              textAlign: "center",
              cursor: "pointer",
            }}
            onClick={() => document.getElementById("imageInput")?.click()}
          >
            <ImageIcon sx={{ fontSize: 50, color: "#4C73FF" }} />
            <Typography color="gray">
              Cliquez pour importer des images
            </Typography>

            <input
              id="imageInput"
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={handleSelectImages}
            />
          </Box>

          {previewImages.length > 0 && (
            <Box sx={{ display: "flex", gap: 2, mt: 2, flexWrap: "wrap" }}>
              {previewImages.map((src, i) => (
                <Box key={i} sx={{ position: "relative" }}>
                  <Card
                    sx={{
                      width: 120,
                      height: 90,
                      borderRadius: 2,
                      backgroundImage: `url(${src})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />

                  <IconButton
                    size="small"
                    sx={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                      bgcolor: "#fff",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                    }}
                    onClick={() => removeImage(i)}
                  >
                    <CloseIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          <TextField
            fullWidth
            label="Nom de l’article"
            sx={{ mb: 2 }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <TextField
            fullWidth
            label="Prix (€)"
            type="number"
            sx={{ mb: 2 }}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />

          <TextField
            fullWidth
            label="Frais de livraison (€)"
            type="number"
            sx={{ mb: 2 }}
            value={shippingCost}
            onChange={(e) => setShippingCost(Number(e.target.value))}
          />

          <Autocomplete
            sx={{ mb: 2 }}
            options={categories}
            getOptionLabel={(opt) => opt.name}
            value={selectedCategory}
            onChange={(_, v) => setSelectedCategory(v)}
            renderInput={(params) => (
              <TextField {...params} label="Catégorie" />
            )}
          />

          <TextField
            fullWidth
            label="Description"
            multiline
            rows={4}
            sx={{ mb: 2 }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {errorMessage && (
            <Typography
              color="red"
              fontSize={14}
              sx={{ mb: 2, textAlign: "center" }}
            >
              {errorMessage}
            </Typography>
          )}

          <AnimatedButton
            label="Créer l’article"
            width="100%"
            onClick={handleSubmit}
          />
        </Card>
      </Container>
    </UserPageLayout>
  );
}
