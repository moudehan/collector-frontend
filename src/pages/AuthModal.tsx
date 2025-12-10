import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Link,
  TextField,
  Typography,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import FacebookIcon from "@mui/icons-material/Facebook";
import GoogleIcon from "@mui/icons-material/Google";

import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AnimatedButton from "../components/Button";
import { useAuth } from "../contexte/UseAuth";
import { login, registerUser } from "../services/auth.api";

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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { refreshUser } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    setInternalMode(mode);
  }, [mode]);

  const toggleMode = () => {
    const m = internalMode === "login" ? "register" : "login";
    setInternalMode(m);
    setMode?.(m);
    setError("");
  };
  const isValidEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const isValidPassword = (value: string) => {
    return value.length >= 8;
  };

  async function handleLogin() {
    setError("");

    if (!email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Adresse email ou mot de passe incorrect.");
      return;
    }

    try {
      setLoading(true);

      const data = await login(email, password);
      localStorage.setItem("UserToken", data.access_token);
      await refreshUser();

      onClose();
      navigate("/Home");
    } catch {
      setError("Email ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    setError("");

    if (!firstname || !lastname || !email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Format d'email invalide.");
      return;
    }

    if (!isValidPassword(password)) {
      setError("Le mot de passe doit contenir au minimum 8 caractères.");
      return;
    }

    try {
      setLoading(true);

      const data = await registerUser(firstname, lastname, email, password);

      if (data) {
        enqueueSnackbar("Votre compte a bien été créé !", {
          variant: "success",
        });
      }

      onClose();
      navigate("/");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création du compte.");
    } finally {
      setLoading(false);
    }
  }

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

        <IconButton size="small" onClick={onClose}>
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
          <AnimatedButton width="100%" height={55} color="#1877F2">
            <FacebookIcon /> <Typography ml={1}>Facebook</Typography>
          </AnimatedButton>

          <AnimatedButton width="100%" height={55} variant="outlined">
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
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
            />
            <TextField
              label="Nom"
              fullWidth
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
            />
          </Box>
        )}

        <TextField
          fullWidth
          label="Adresse email"
          sx={{ mb: 2 }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          fullWidth
          type="password"
          label="Mot de passe"
          sx={{ mb: 1 }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <Typography color="red" fontSize={13} mt={1}>
            {error}
          </Typography>
        )}

        <Typography fontSize={11} color="gray" mt={2}>
          En continuant, vous acceptez nos{" "}
          <Link underline="hover">Conditions d'utilisation</Link> et notre{" "}
          <Link underline="hover">Politique de confidentialité</Link>.
        </Typography>

        <AnimatedButton
          width="100%"
          height={50}
          sx={{
            mt: 3,
            fontSize: 17,
            fontWeight: 700,
            bgcolor: "#0047FF",
            opacity: loading ? 0.6 : 1,
          }}
          onClick={() =>
            internalMode === "login" ? handleLogin() : handleRegister()
          }
        >
          {loading
            ? "Chargement..."
            : internalMode === "login"
            ? "Se connecter"
            : "Créer mon compte"}
        </AnimatedButton>
      </DialogContent>
    </Dialog>
  );
}
