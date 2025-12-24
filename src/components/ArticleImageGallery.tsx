import { Box, Card, IconButton } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
const API_URL = import.meta.env.VITE_API_URL;

interface ImageObj {
  url: string;
}

interface Props {
  images: ImageObj[];
}

function buildImageUrl(rawUrl?: string): string {
  if (!rawUrl) return "/placeholder.png";
  if (rawUrl.startsWith("http")) return rawUrl;
  return `${API_URL}${rawUrl}`;
}

export default function ArticleImageGallery({ images }: Props) {
  const [selectedImage, setSelectedImage] = useState<string>(
    buildImageUrl(images[0]?.url)
  );
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedImage(buildImageUrl(images[0]?.url));
  }, [images]);

  const scrollThumbnails = (direction: "left" | "right") => {
    if (!thumbnailsRef.current) return;
    const scrollAmount = 140;

    thumbnailsRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <Box sx={{ flex: 2 }}>
      <Card
        sx={{
          height: 450,
          borderRadius: 3,
          overflow: "hidden",
          mb: 2,
          backgroundImage: `url(${selectedImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          position: "relative",
          mt: 1,
        }}
      >
        <IconButton
          onClick={() => scrollThumbnails("left")}
          sx={{
            position: "absolute",
            left: -20,
            zIndex: 5,
            background: "white",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            borderRadius: "50%",
            "&:focus": { outline: "none" },
          }}
        >
          <ArrowBackIosIcon />
        </IconButton>

        <Box
          ref={thumbnailsRef}
          sx={{
            display: "flex",
            gap: 2,
            overflowX: "auto",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
            pl: 2,
            pr: 2,
            maxWidth: `calc(120px * 5 + 8px * 4)`,
          }}
        >
          {images.map((img, idx) => {
            const imageUrl = buildImageUrl(img.url);

            return (
              <Card
                key={idx}
                sx={{
                  minWidth: 120,
                  height: 90,
                  borderRadius: 2,
                  overflow: "hidden",
                  cursor: "pointer",
                  backgroundImage: `url(${imageUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  border:
                    imageUrl === selectedImage
                      ? "3px solid #4C73FF"
                      : "2px solid transparent",
                  transition: "0.2s",
                  flexShrink: 0,
                }}
                onClick={() => setSelectedImage(imageUrl)}
              />
            );
          })}
        </Box>

        <IconButton
          onClick={() => scrollThumbnails("right")}
          sx={{
            position: "absolute",
            right: -20,
            zIndex: 5,
            background: "white",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            borderRadius: "50%",
            "&:focus": { outline: "none" },
          }}
        >
          <ArrowForwardIosIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
