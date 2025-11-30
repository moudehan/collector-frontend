import { AppBar, Toolbar, Button, Typography, Box } from "@mui/material";
import AnimatedButton from "./Button";
import AuthModal from "../pages/AuthModal";
import { useState } from "react";

export default function AppNavbar() {
  const [openAuth, setOpenAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        sx={{ bgcolor: "#fff", borderBottom: "1px solid #e5e5e5" }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" fontWeight={700} sx={{ color: "#1e4fff" }}>
            COLLECTOR<span>.shop</span>
          </Typography>

          <Box sx={{ display: "flex", gap: 3 }}>
            <Button color="inherit">Browse</Button>
            <Button color="inherit">Sell</Button>
            <Button color="inherit">My Account</Button>
            <Button color="inherit">Admin</Button>
            <AnimatedButton
              label="Sign In"
              variant="outlined"
              onClick={() => {
                setAuthMode("login");
                setOpenAuth(true);
              }}
            />{" "}
          </Box>
        </Toolbar>
      </AppBar>
      <AuthModal
        open={openAuth}
        onClose={() => setOpenAuth(false)}
        mode={authMode}
        setMode={setAuthMode}
      />{" "}
    </>
  );
}
