import type { ReactNode } from "react";

import DoorSlidingIcon from "@mui/icons-material/DoorSliding";
import EventIcon from "@mui/icons-material/Event";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import StraightenIcon from "@mui/icons-material/Straighten";
import { Box, Card, Divider, Typography } from "@mui/material";

import type { Article } from "../types/article.type";

interface Props {
  article: Article;
}

export default function ArticleInfoSection({ article }: Props) {
  const formattedPrice = `${Number(article.price ?? 0).toFixed(2)} €`;
  const etat = article.conditionLabel ?? "Non renseigné";
  const era = article.vintageEra ?? "Non précisée";
  const year = article.productionYear
    ? article.productionYear.toString()
    : "Non renseignée";

  const quantityLabel =
    (article.quantity ?? 0) <= 0
      ? "Plus disponible"
      : article.quantity === 1
      ? "Article unique (1 exemplaire)"
      : `${article.quantity} exemplaires disponibles`;

  return (
    <Card
      sx={{
        mt: 4,
        p: 4,
        borderRadius: 4,
        background: "linear-gradient(180deg,#ffffff,#fafbff)",
        boxShadow: "0 8px 30px rgba(0,0,0,0.05)",
        border: "1px solid #eef0f7",
      }}
    >
      <Typography fontSize={26} fontWeight={900} mb={3}>
        Détails de l’article
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 4,
        }}
      >
        <InfoItem
          icon={<HomeIcon sx={{ fontSize: 28, color: "#4C73FF" }} />}
          label="Type d’article"
          value={article.category?.name || "Non spécifié"}
        />

        <InfoItem
          icon={<InfoIcon sx={{ fontSize: 28, color: "#4C73FF" }} />}
          label="Prix"
          value={formattedPrice}
          highlight
        />

        <InfoItem
          icon={<StraightenIcon sx={{ fontSize: 28, color: "#4C73FF" }} />}
          label="Époque"
          value={era}
        />

        <InfoItem
          icon={<EventIcon sx={{ fontSize: 28, color: "#4C73FF" }} />}
          label="Année de production"
          value={year}
        />

        <InfoItem
          icon={<Inventory2Icon sx={{ fontSize: 28, color: "#4C73FF" }} />}
          label="Disponibilité"
          value={quantityLabel}
        />

        <InfoItem
          icon={<DoorSlidingIcon sx={{ fontSize: 28, color: "#4C73FF" }} />}
          label="État"
          value={etat || "Très bon état"}
        />

        <InfoItem
          icon={<DoorSlidingIcon sx={{ fontSize: 28, color: "#4C73FF" }} />}
          label="Nombre de suivi"
          value={article.likesCount}
        />
      </Box>

      <Divider sx={{ my: 4 }} />

      {article.vintageNotes && (
        <>
          <Typography fontWeight={800} fontSize={18} mt={3} mb={1}>
            Détails vintage
          </Typography>
          <Typography color="gray" sx={{ lineHeight: 1.6, fontSize: 15 }}>
            {article.vintageNotes}
          </Typography>
        </>
      )}
    </Card>
  );
}

function InfoItem({
  icon,
  label,
  value,
  highlight,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
      <Box
        sx={{
          width: 45,
          height: 45,
          borderRadius: "12px",
          background: "#f0f4ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "inset 0 0 10px rgba(0,0,0,0.05)",
        }}
      >
        {icon}
      </Box>

      <Box>
        <Typography fontSize={13} mb={0.5} color="gray" fontWeight={600}>
          {label.toUpperCase()}
        </Typography>

        <Typography
          fontSize={16}
          fontWeight={highlight ? 800 : 600}
          color={highlight ? "#4C73FF" : "#1e1e1e"}
        >
          {value}
        </Typography>
      </Box>
    </Box>
  );
}
