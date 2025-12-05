import ArticleIcon from "@mui/icons-material/Article";
import CloseIcon from "@mui/icons-material/Close";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PersonIcon from "@mui/icons-material/Person";
import SellIcon from "@mui/icons-material/Sell";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";

import {
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";

import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  firstname: string;
}

export default function UserMenuDrawer({ open, onClose, firstname }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const menuItems = [
    { label: "Mon profil", path: "/profile", icon: <PersonIcon /> },
    {
      label: "Historique d’achats",
      path: "/purchase-history",
      icon: <ShoppingBagIcon />,
    },
    {
      label: "Historique de ventes",
      path: "/sales-history",
      icon: <SellIcon />,
    },
    { label: "Mes articles", path: "/my-articles", icon: <ArticleIcon /> },
    { label: "Mes favoris", path: "/favorites", icon: <FavoriteIcon /> },
  ];

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box
        sx={{
          width: 280,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* HEADER */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #0047FF, #002B99)",
            color: "#fff",
            py: 4,
            px: 2,
            position: "relative",
            textAlign: "center",
          }}
        >
          <IconButton
            onClick={onClose}
            sx={{ position: "absolute", top: 12, right: 12, color: "#fff" }}
          >
            <CloseIcon />
          </IconButton>

          <Avatar
            sx={{
              width: 70,
              height: 70,
              bgcolor: "#fff",
              margin: "0 auto",
              color: "#0047FF",
              fontSize: 28,
              fontWeight: 700,
              border: "3px solid #fff",
            }}
          >
            {firstname[0].toUpperCase()}
          </Avatar>

          <Typography fontSize={20} fontWeight={700} mt={1}>
            {firstname}
          </Typography>

          <Typography fontSize={13} color="rgba(255,255,255,0.7)">
            Mon compte Collector
          </Typography>
        </Box>

        {/* MENU */}
        <Box sx={{ flexGrow: 1, p: 2 }}>
          <List>
            {menuItems.map((item) => (
              <ListItemButton
                key={item.label}
                onClick={() => {
                  setSelected(item.label);
                  window.location.href = item.path;
                }}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  backgroundColor:
                    selected === item.label
                      ? "rgba(0, 71, 255, 0.12)"
                      : "transparent",
                  "&:hover": { backgroundColor: "rgba(0, 71, 255, 0.18)" },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: selected === item.label ? "#0047FF" : "#222",
                    minWidth: 34,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: selected === item.label ? 700 : 500,
                    color: selected === item.label ? "#0047FF" : "#222",
                  }}
                />
              </ListItemButton>
            ))}

            <Divider sx={{ my: 2 }} />

            {/* LOGOUT */}
            <ListItemButton
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              sx={{
                borderRadius: 2,
                "&:hover": { backgroundColor: "rgba(255, 0, 0, 0.12)" },
              }}
            >
              <ListItemText
                primary="Se déconnecter"
                primaryTypographyProps={{
                  color: "red",
                  fontWeight: 700,
                }}
              />
            </ListItemButton>
          </List>
        </Box>
      </Box>
    </Drawer>
  );
}
