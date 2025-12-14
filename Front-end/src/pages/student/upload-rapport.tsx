import { useState } from "react";
import { Box, Button, Typography, TextField, Snackbar, Alert } from "@mui/material";
import UploadDropzone from "../../components/UploadDropzone";

const API_BASE = "http://localhost:5000/api/v1";

export default function UploadRapport() {
  const [file, setFile] = useState<File | null>(null);
  const [titre, setTitre] = useState("");
  const [open, setOpen] = useState(false);

  const handleUpload = async () => {
    if (!file || !titre) return;

    const form = new FormData();
    form.append("file", file);
    form.append("titre", titre);

    await fetch(`${API_BASE}/rapports/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: form,
    });

    setOpen(true);
  };

  return (
    <Box>
      <Typography variant="h5" mb={2}>📤 Upload Rapport</Typography>

      <TextField
        fullWidth
        label="Titre du rapport"
        value={titre}
        onChange={(e) => setTitre(e.target.value)}
        sx={{ mb: 2 }}
      />

      <UploadDropzone onFile={setFile} />

      {file && (
        <Typography mt={2} color="primary">
          ✔ Fichier sélectionné : {file.name}
        </Typography>
      )}

      <Button
        variant="contained"
        fullWidth
        sx={{ mt: 3 }}
        onClick={handleUpload}
      >
        Uploader
      </Button>

      <Snackbar open={open} autoHideDuration={4000}>
        <Alert severity="success">
          Rapport envoyé – analyse en cours ⏳
        </Alert>
      </Snackbar>
    </Box>
  );
}
