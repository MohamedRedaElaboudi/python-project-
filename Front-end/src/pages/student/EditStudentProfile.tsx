import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  Grid,
  Alert,
  Button,
  MenuItem,
  TextField,
  Typography,
  CardContent,
  CircularProgress,
} from "@mui/material";
import {
  getStudentProfile,
  updateStudentProfile,
} from "../../api/studentProfile";

/* ============================
   NIVEAUX AUTORISÉS (3 ANNÉES)
============================ */
const NIVEAUX = [
  "1ère année",
  "2ème année",
  "3ème année",
];

export default function EditStudentProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const nav = useNavigate();

  /* ================= LOAD PROFILE ================= */
  useEffect(() => {
    getStudentProfile()
      .then(setProfile)
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <Typography color="error">
        Impossible de charger le profil
      </Typography>
    );
  }

  if (!profile) {
    return <CircularProgress />;
  }

  /* ================= SUBMIT ================= */
  const submit = async () => {
    try {
      // ✅ on envoie UNIQUEMENT les champs autorisés
      await updateStudentProfile({
        tel: profile.tel,
        niveau: profile.niveau,
      });

      setSuccess(true);
      setTimeout(() => nav("/student/profile"), 1200);
    } catch {
      setError(true);
    }
  };

  return (
    <Box maxWidth={900} mx="auto">
      <Typography variant="h4" fontWeight="bold" mb={3}>
        👤 Profil Étudiant
      </Typography>

      {success && <Alert severity="success">Profil mis à jour</Alert>}

      <Card>
        <CardContent>
          <Grid container spacing={2}>

            {/* ===== CHAMPS NON MODIFIABLES ===== */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField label="Nom" value={profile.name} fullWidth disabled />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField label="Prénom" value={profile.prenom} fullWidth disabled />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Email académique"
                value={profile.email}
                fullWidth
                disabled
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField label="CIN" value={profile.cin} fullWidth disabled />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField label="CNE" value={profile.cne} fullWidth disabled />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField label="Filière" value={profile.filiere} fullWidth disabled />
            </Grid>

            {/* ===== CHAMPS MODIFIABLES ===== */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Téléphone"
                value={profile.tel || ""}
                onChange={(e) =>
                  setProfile({ ...profile, tel: e.target.value })
                }
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                select
                label="Niveau"
                value={profile.niveau}
                onChange={(e) =>
                  setProfile({ ...profile, niveau: e.target.value })
                }
              >
                {NIVEAUX.map((niv) => (
                  <MenuItem key={niv} value={niv}>
                    {niv}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

          </Grid>

          <Button
            variant="contained"
            sx={{ mt: 3 }}
            onClick={submit}
          >
            💾 Enregistrer
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
