import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  Chip,
  Grid,
  Button,
  Typography,
  CardContent,
  CircularProgress,
} from "@mui/material";
import { getStudentProfile } from "../../api/studentProfile";

export default function StudentProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState(false);
  const nav = useNavigate();

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

  return (
    <Box maxWidth={900} mx="auto">
      <Typography variant="h4" fontWeight="bold" mb={3}>
        👤 Mon Profil
      </Typography>

      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography><b>Nom :</b> {profile.name}</Typography>
              <Typography><b>Prénom :</b> {profile.prenom}</Typography>
              <Typography><b>Email :</b> {profile.email}</Typography>
              <Chip label="Email académique" color="success" size="small" />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography><b>CIN :</b> {profile.cin}</Typography>
              <Typography><b>CNE :</b> {profile.cne}</Typography>
              <Typography><b>Filière :</b> {profile.filiere}</Typography>
              <Typography><b>Niveau :</b> {profile.niveau}</Typography>
              <Typography><b>Téléphone :</b> {profile.tel || "—"}</Typography>
            </Grid>
          </Grid>

          <Button
            variant="contained"
            sx={{ mt: 3 }}
            onClick={() => nav("/student/profile/edit")}
          >
            ✏️ Modifier mon profil
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
