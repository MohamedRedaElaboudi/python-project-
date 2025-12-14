import { useState, useEffect } from "react";
import {
  Box,
  Card,
  Chip,
  Grid, // Named import for Grid
  Button,
  Typography,
  CardContent,
} from "@mui/material";

const API_BASE = "http://localhost:5000/api/v1";

export default function StudentDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  /* ================= FETCH DASHBOARD ================= */
  useEffect(() => {
    fetch(`${API_BASE}/student/dashboard`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  /* ================= DOWNLOAD PDF ================= */
  const downloadRapport = async () => {
    if (!data?.rapport) return;

    const res = await fetch(
      `${API_BASE}/rapports/download/${data.rapport.id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rapport.pdf";
    a.click();
  };

  /* ================= STATUS HELPERS ================= */
  const getRapportStatusLabel = (status?: string) =>
    status === "uploaded"
      ? "En cours"
      : status === "validated"
      ? "Validé"
      : status === "rejected"
      ? "Refusé"
      : "—";

  const getRapportStatusColor = (status?: string) =>
    status === "uploaded"
      ? "warning"
      : status === "validated"
      ? "success"
      : status === "rejected"
      ? "error"
      : "default";

  if (loading) return <Typography>Chargement...</Typography>;
  if (!data) return <Typography color="error">Erreur chargement</Typography>;

  const { rapport, soutenance } = data;

  return (
    <Box>
      {/* ================= HEADER ================= */}
      <Box mb={4} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Typography sx={{ fontSize: 28 }}>🎓</Typography>

        <Box>
          <Typography variant="h4" fontWeight="bold">
            Hi, Welcome back 👋
          </Typography>

          <Typography
            sx={{
              color: (theme) =>
                theme.palette.mode === "dark" ? "#9CA3AF" : "#6B7280",
            }}
          >
            {user?.prenom} {user?.name}
          </Typography>
        </Box>
      </Box>

      {/* ================= CONTENT ================= */}
      <Grid container spacing={3}>
        {/* ===== RAPPORT ===== */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              borderRadius: 3,
              backgroundColor: (theme) =>
                theme.palette.mode === "dark" ? "#020617" : "#F9FAFB",
              boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
            }}
          >
            <CardContent>
              <Typography variant="h6">📄 Mon Rapport</Typography>

              {rapport ? (
                <>
                  <Typography fontWeight="bold" mt={1}>
                    {rapport.titre}
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,
                      color: (theme) =>
                        theme.palette.mode === "dark"
                          ? "#9CA3AF"
                          : "#6B7280",
                    }}
                  >
                    Date :{" "}
                    {new Date(rapport.created_at).toLocaleDateString()}
                  </Typography>

                  <Chip
                    sx={{ mt: 2 }}
                    label={getRapportStatusLabel(rapport.status)}
                    color={getRapportStatusColor(rapport.status)}
                  />

                  <Button
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3 }}
                    onClick={downloadRapport}
                  >
                    📥 Télécharger le PDF
                  </Button>
                </>
              ) : (
                <Typography
                  sx={{
                    mt: 1,
                    color: (theme) =>
                      theme.palette.mode === "dark"
                        ? "#9CA3AF"
                        : "#6B7280",
                  }}
                >
                  Aucun rapport soumis
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ===== SOUTENANCE ===== */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              borderRadius: 3,
              backgroundColor: (theme) =>
                theme.palette.mode === "dark" ? "#020617" : "#F3F4F6",
              boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
            }}
          >
            <CardContent>
              <Typography variant="h6">📅 Soutenance</Typography>

              {soutenance ? (
                <>
                  <Typography mt={1}>
                    <b>Date :</b>{" "}
                    {new Date(soutenance.date_debut).toLocaleString()}
                  </Typography>

                  <Typography>
                    <b>Salle :</b> {soutenance.salle}
                  </Typography>

                  <Chip
                    sx={{ mt: 2 }}
                    label={soutenance.statut}
                    color="info"
                  />
                </>
              ) : (
                <Typography
                  sx={{
                    mt: 1,
                    color: (theme) =>
                      theme.palette.mode === "dark"
                        ? "#9CA3AF"
                        : "#6B7280",
                  }}
                >
                  Soutenance non planifiée
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
