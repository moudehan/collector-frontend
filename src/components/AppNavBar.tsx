import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import LanguageIcon from "@mui/icons-material/Language";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";

import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  InputAdornment,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";

import { useState } from "react";
import UserMenuDrawer from "../layout/UserMenuDrawer";
import AuthModal from "../pages/AuthModal";
import AnimatedButton from "./Button";

export default function AppNavbar() {
  const token = localStorage.getItem("UserToken");
  const firstname = localStorage.getItem("firstname") || "U";
  const [openAuth, setOpenAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [openDrawer, setOpenDrawer] = useState(false);
  const toggleDrawer = () => setOpenDrawer(!openDrawer);

  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: "#fff",
          borderBottom: "1px solid #e5e5e5",
          py: 0.5,
          pl: 10,
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            px: 2,
          }}
        >
          {/* LOGO */}
          <Typography
            variant="h5"
            fontWeight={1000}
            sx={{ color: "#1e4fff", whiteSpace: "nowrap" }}
          >
            COLLECTOR<span style={{ color: "#000" }}>.shop</span>
          </Typography>

          {/* SEARCH BAR */}
          <Box sx={{ flexGrow: 0.6 }}>
            <TextField
              fullWidth
              placeholder="Rechercher une marque, un modèle..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#1e4fff" }} />
                  </InputAdornment>
                ),
                sx: {
                  backgroundColor: "#f1f3f8",
                  height: 50,
                },
              }}
              sx={{
                "& .MuiInputBase-root": {
                  fontSize: "16px",
                  height: 50,
                },
              }}
            />
          </Box>

          {/* RIGHT SECTION */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <FavoriteBorderIcon sx={{ color: "#1e4fff", fontSize: 30 }} />
            <LanguageIcon sx={{ color: "#1e4fff", fontSize: 30 }} />

            {/* Avatar (non clickable) */}
            {token && (
              <>
                <Avatar sx={{ bgcolor: "#1e4fff", width: 45, height: 45 }}>
                  {firstname[0].toUpperCase()}
                </Avatar>

                <IconButton
                  disableRipple
                  sx={{
                    "&:focus": { outline: "none" },
                    "&:focus-visible": { outline: "none" },
                    "& .MuiTouchRipple-root": { display: "none" },
                    "&:active": { outline: "none" },
                    ml: 20,
                  }}
                  onClick={toggleDrawer}
                >
                  <MenuIcon sx={{ fontSize: 30, color: "#1e4fff" }} />
                </IconButton>
              </>
            )}
            {!token && (
              <AnimatedButton
                label="Se connecter"
                variant="outlined"
                width="auto"
                onClick={() => {
                  setAuthMode("login");
                  setOpenAuth(true);
                }}
              />
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <AuthModal
        open={openAuth}
        onClose={() => setOpenAuth(false)}
        mode={authMode}
        setMode={setAuthMode}
      />
      {/* Drawer externe */}
      <UserMenuDrawer
        open={openDrawer}
        onClose={toggleDrawer}
        firstname={firstname}
      />
    </>
  );
}
