import { Box, Button, Modal, Typography } from "@mui/material";

interface Props {
  open: boolean;
  label: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function ModalDeleteConfirm({
  open,
  label,
  onClose,
  onConfirm,
}: Props) {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          p: 4,
          bgcolor: "white",
          width: 450,
          mx: "auto",
          mt: 10,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" mb={2}>
          êtes-vous sûr de supprimer "{label}" ?
        </Typography>

        <Typography mb={3}>Cette action est irréversible.</Typography>

        <Button variant="contained" color="error" fullWidth onClick={onConfirm}>
          Supprimer définitivement
        </Button>

        <Button fullWidth sx={{ mt: 1 }} onClick={onClose}>
          Annuler
        </Button>
      </Box>
    </Modal>
  );
}
