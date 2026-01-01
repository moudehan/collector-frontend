import {
  Autocomplete,
  Box,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";

import { useState, type ChangeEvent } from "react";

import AnimatedButton from "../../components/Button";
import type {
  Article,
  ArticleImage,
  Category,
  UpdatedArticlePayload,
} from "../../types/article.type";

interface Props {
  open: boolean;
  onClose: () => void;
  article: Article;
  categories: Category[];
  onSave: (updatedArticle: UpdatedArticlePayload) => Promise<void>;
}

export default function ArticleEditModal({
  open,
  onClose,
  article,
  categories,
  onSave,
}: Props) {
  const [title, setTitle] = useState<string>(article.title);
  const [price, setPrice] = useState<number | string>(article.price);
  const [shippingCost, setShippingCost] = useState<number | string>(
    article.shipping_cost
  );
  const [description, setDescription] = useState<string>(article.description);

  const [selectedCategory, setSelectedCategory] = useState<Category>(
    article.category
  );

  const [images, setImages] = useState<ArticleImage[]>(article.images || []);
  const [newImages, setNewImages] = useState<File[]>([]);

  const [quantity, setQuantity] = useState<number | string>(
    article.quantity ?? 1
  );
  const [vintageEra, setVintageEra] = useState<string>(
    article.vintageEra ?? ""
  );
  const [productionYear, setProductionYear] = useState<number | string>(
    article.productionYear ?? ""
  );
  const [conditionLabel, setConditionLabel] = useState<string>(
    article.conditionLabel ?? ""
  );
  const [vintageNotes, setVintageNotes] = useState<string>(
    article.vintageNotes ?? ""
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleAddImages(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;
    setNewImages((prev) => [...prev, ...files]);
  }

  function deleteOldImage(url: string) {
    setImages((prev) => prev.filter((img) => img.url !== url));
  }

  function deleteNewImage(file: File) {
    setNewImages((prev) => prev.filter((f) => f !== file));
  }

  function extractErrorMessage(err: unknown): string {
    if (err instanceof Error && err.message) return err.message;

    if (typeof err === "object" && err !== null) {
      const maybeWithResponse = err as { response?: { data?: unknown } };
      const data = maybeWithResponse.response?.data;
      if (data && typeof data === "object") {
        const typed = data as { message?: string | string[] };
        if (Array.isArray(typed.message) && typed.message.length > 0) {
          return String(typed.message[0]);
        }
        if (typeof typed.message === "string") return typed.message;
      }
    }
    return "Erreur lors de la modification de l’article.";
  }

  async function handleSave() {
    setErrorMessage(null);

    const shippingCostNumber = shippingCost === "" ? 0 : Number(shippingCost);

    const payload: UpdatedArticlePayload = {
      title,
      price,
      description,
      categoryId: selectedCategory.id,
      shopId: article.shop.id,
      oldImages: images,
      newImages,
      quantity: quantity === "" ? undefined : Number(quantity),
      shipping_cost: shippingCostNumber,
      vintageEra: vintageEra.trim() || undefined,
      productionYear:
        productionYear === "" ? undefined : Number(productionYear),
      conditionLabel: conditionLabel.trim() || undefined,
      vintageNotes: vintageNotes.trim() || undefined,
    };

    try {
      await onSave(payload);
      onClose();
    } catch (err: unknown) {
      setErrorMessage(extractErrorMessage(err));
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          fontWeight: 900,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        Modifier l’article
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ mt: 2 }}>
        <Typography fontWeight={700}>Images existantes</Typography>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", my: 1 }}>
          {images.map((img, index) => (
            <Box key={index} sx={{ position: "relative" }}>
              <Card
                sx={{
                  width: 110,
                  height: 90,
                  backgroundImage: `url(${img.url})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  borderRadius: 2,
                }}
              />
              <IconButton
                size="small"
                onClick={() => deleteOldImage(img.url)}
                sx={{
                  position: "absolute",
                  top: -10,
                  right: -10,
                  background: "#fff",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography fontWeight={700}>Ajouter de nouvelles images</Typography>

        <Box
          onClick={() => document.getElementById("editImageInput")?.click()}
          sx={{
            border: "2px dashed #4C73FF",
            borderRadius: 3,
            p: 2,
            textAlign: "center",
            cursor: "pointer",
            mt: 1,
          }}
        >
          <ImageIcon sx={{ fontSize: 40, color: "#4C73FF" }} />
          <Typography fontSize={14} color="gray">
            Cliquez pour ajouter d&apos;autres images (JPG, PNG)
          </Typography>

          <input
            id="editImageInput"
            type="file"
            multiple
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleAddImages}
          />
        </Box>

        {newImages.length > 0 && (
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 1 }}>
            {newImages.map((file, index) => (
              <Box key={index} sx={{ position: "relative" }}>
                <Card
                  sx={{
                    width: 110,
                    height: 90,
                    backgroundImage: `url(${URL.createObjectURL(file)})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <IconButton
                  size="small"
                  onClick={() => deleteNewImage(file)}
                  sx={{
                    position: "absolute",
                    top: -10,
                    right: -10,
                    background: "#fff",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        <TextField
          fullWidth
          label="Titre"
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
          onChange={(e) =>
            setPrice(e.target.value === "" ? "" : Number(e.target.value))
          }
        />

        <TextField
          fullWidth
          label="Frais de port (€)"
          type="number"
          sx={{ mb: 2 }}
          value={shippingCost}
          inputProps={{ min: 0 }}
          onChange={(e) =>
            setShippingCost(e.target.value === "" ? "" : Number(e.target.value))
          }
        />

        <TextField
          fullWidth
          label="Quantité disponible"
          type="number"
          sx={{ mb: 2 }}
          value={quantity}
          inputProps={{ min: 1 }}
          onChange={(e) =>
            setQuantity(e.target.value === "" ? "" : Number(e.target.value))
          }
        />

        <Autocomplete
          sx={{ mb: 2 }}
          options={categories}
          getOptionLabel={(opt) => opt.name}
          value={selectedCategory}
          onChange={(_, v) => setSelectedCategory(v as Category)}
          renderInput={(params) => <TextField {...params} label="Catégorie" />}
        />

        <TextField
          fullWidth
          label="Époque (ex : Années 90, Y2K...)"
          sx={{ mb: 2 }}
          value={vintageEra}
          onChange={(e) => setVintageEra(e.target.value)}
        />

        <TextField
          fullWidth
          label="Année de production (approx.)"
          type="number"
          sx={{ mb: 2 }}
          value={productionYear}
          onChange={(e) =>
            setProductionYear(
              e.target.value === "" ? "" : Number(e.target.value)
            )
          }
        />

        <TextField
          fullWidth
          label="État (ex : Très bon état, Bon état, Correct...)"
          sx={{ mb: 2 }}
          value={conditionLabel}
          onChange={(e) => setConditionLabel(e.target.value)}
        />

        <TextField
          fullWidth
          label="Détails vintage (histoire, particularités, etc.)"
          multiline
          rows={3}
          sx={{ mb: 2 }}
          value={vintageNotes}
          onChange={(e) => setVintageNotes(e.target.value)}
        />

        <TextField
          fullWidth
          label="Description"
          multiline
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {errorMessage && (
          <Typography color="error" sx={{ mt: 2 }}>
            {errorMessage}
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <AnimatedButton label="Enregistrer" width="100%" onClick={handleSave} />
      </DialogActions>
    </Dialog>
  );
}
