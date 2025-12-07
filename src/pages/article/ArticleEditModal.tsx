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

import { useState } from "react";

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
  onSave: (updatedArticle: UpdatedArticlePayload) => void;
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
  const [description, setDescription] = useState<string>(article.description);

  const [selectedCategory, setSelectedCategory] = useState<Category>(
    article.category
  );

  const [images, setImages] = useState<ArticleImage[]>(article.images || []);
  const [newImages, setNewImages] = useState<File[]>([]);

  function handleAddImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setNewImages((prev) => [...prev, ...files]);
  }

  function deleteOldImage(url: string) {
    setImages((prev) => prev.filter((img) => img.url !== url));
  }

  function deleteNewImage(file: File) {
    setNewImages((prev) => prev.filter((f) => f !== file));
  }

  function handleSave() {
    const payload: UpdatedArticlePayload = {
      title,
      price,
      description,
      categoryId: selectedCategory.id,
      shopId: article.shop.id,
      oldImages: images,
      newImages: newImages,
    };

    onSave(payload);
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
            Cliquez pour ajouter d'autres images (JPG, PNG)
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
          onChange={(e) => setPrice(Number(e.target.value))}
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
          label="Description"
          multiline
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <AnimatedButton label="Enregistrer" width="100%" onClick={handleSave} />
      </DialogActions>
    </Dialog>
  );
}
