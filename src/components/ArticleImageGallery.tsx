import { Box, Card, IconButton } from "@mui/material";
import { useRef, useState } from "react";

import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

interface ImageObj {
  url: string;
}

interface Props {
  images: ImageObj[];
}

export default function ArticleImageGallery({ images }: Props) {
  const [selectedImage, setSelectedImage] = useState<string>(images[0]?.url);
  const thumbnailsRef = useRef<HTMLDivElement>(null);

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
          {images.map((img, idx) => (
            <Card
              key={idx}
              sx={{
                minWidth: 120,
                height: 90,
                borderRadius: 2,
                overflow: "hidden",
                cursor: "pointer",
                backgroundImage: `url(${img.url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                border:
                  img.url === selectedImage
                    ? "3px solid #4C73FF"
                    : "2px solid transparent",
                transition: "0.2s",
                flexShrink: 0,
              }}
              onClick={() => setSelectedImage(img.url)}
            />
          ))}
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
