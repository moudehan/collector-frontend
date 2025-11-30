import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Divider,
  Box,
  Typography,
  Link,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import FacebookIcon from "@mui/icons-material/Facebook";
import GoogleIcon from "@mui/icons-material/Google";

import AnimatedButton from "../components/Button";
import { useState, useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  mode?: "login" | "register";
  setMode?: (m: "login" | "register") => void;
}

export default function AuthModal({
  open,
  onClose,
  mode = "login",
  setMode,
}: Props) {
  const [internalMode, setInternalMode] = useState<"login" | "register">(mode);

  useEffect(() => {
    setInternalMode(mode);
  }, [mode]);

  const toggleMode = () => {
    const m = internalMode === "login" ? "register" : "login";
    setInternalMode(m);
    setMode?.(m);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px={2.5}
        py={1.5}
        borderBottom="1px solid #e5e5e5"
      >
        <DialogTitle sx={{ p: 0, fontSize: 18, fontWeight: 700 }}>
          {internalMode === "login" ? "Se connecter" : "Créer un compte"}
        </DialogTitle>

        <IconButton
          size="small"
          sx={{ "&:focus": { outline: "none" } }}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography fontSize={22} fontWeight={700}>
            {internalMode === "login" ? "Bon retour !" : "Bienvenue"}
          </Typography>

          <AnimatedButton
            variant="text"
            label={
              internalMode === "login" ? "Créer un compte" : "Se connecter"
            }
            onClick={toggleMode}
            width="auto"
            showArrow={false}
          />
        </Box>

        <Typography fontSize={15} mb={2}>
          Continuer avec
        </Typography>

        <Box display="flex" gap={1.2}>
          <AnimatedButton
            width="100%"
            height={55}
            color="#1877F2"
            sx={{ borderRadius: "4px" }}
          >
            <FacebookIcon /> <Typography ml={1}>Facebook</Typography>
          </AnimatedButton>

          <AnimatedButton
            width="100%"
            height={55}
            variant="outlined"
            sx={{ borderRadius: "4px" }}
          >
            <GoogleIcon /> <Typography ml={1}>Google</Typography>
          </AnimatedButton>
        </Box>

        <Box mt={3} mb={3} display="flex" alignItems="center" gap={1}>
          <Divider sx={{ flex: 1 }} />
          <Typography fontSize={14} color="gray">
            ou
          </Typography>
          <Divider sx={{ flex: 1 }} />
        </Box>

        {internalMode === "register" && (
          <Box display="flex" gap={1.5} mb={2}>
            <TextField
              label="Prénom"
              fullWidth
              placeholder="Jean"
              InputLabelProps={{ style: { color: "gray" } }}
            />
            <TextField
              label="Nom"
              fullWidth
              placeholder="Dupont"
              InputLabelProps={{ style: { color: "gray" } }}
            />
          </Box>
        )}

        <TextField
          fullWidth
          label="Adresse email"
          placeholder="email@email.com"
          sx={{ mb: 2 }}
          InputLabelProps={{ style: { color: "gray" } }}
        />

        <TextField
          fullWidth
          type="password"
          label="Mot de passe"
          placeholder="Min. 8 caractères"
          InputLabelProps={{ style: { color: "gray" } }}
        />

        {internalMode === "register" && (
          <Typography fontSize={11} color="gray" mt={1.5}>
            Min. 8 caractères, une majuscule, un chiffre & un symbole.
          </Typography>
        )}

        <Typography fontSize={11} color="gray" mt={2}>
          En continuant, vous acceptez nos <Link>Conditions d'utilisation</Link>{" "}
          et notre <Link>Politique de confidentialité</Link>.
        </Typography>

        <AnimatedButton
          width="100%"
          height={50}
          sx={{ mt: 3, fontSize: 17, fontWeight: 700, bgcolor: "#0047FF" }}
        >
          {internalMode === "login" ? "Se connecter" : "Créer mon compte"}
        </AnimatedButton>
      </DialogContent>
    </Dialog>
  );
}
