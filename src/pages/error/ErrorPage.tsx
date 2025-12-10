import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function ErrorPage() {
  const navigate = useNavigate();

  return (
    <Box
      minHeight="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      px={2}
    >
      <Typography fontSize={42} fontWeight={900} color="error">
        Accès refusé
      </Typography>

      <Typography mt={2} fontSize={18} color="gray">
        Vous n’êtes pas autorisé à accéder à cette page.
        <br />
        Votre session a expiré ou vous n’êtes pas connecté.
      </Typography>

      <Button
        variant="contained"
        sx={{ mt: 4, px: 4 }}
        onClick={() => navigate("/")}
      >
        Se connecter
      </Button>
    </Box>
  );
}
