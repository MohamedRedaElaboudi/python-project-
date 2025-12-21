import { useState, useEffect } from "react";
import {
  Box,
  Card,
  Chip,
  Grid,
  Stack,
  Button,
  Divider,
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

          <Typography color="text.secondary">
            {user?.prenom} {user?.name}
          </Typography>
        </Box>
      </Box>

      {/* ================= CONTENT ================= */}
      <Grid container spacing={3}>
        {/* ===== RAPPORT ===== */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6">📄 Mon Rapport</Typography>

              {rapport ? (
                <>
                  <Typography fontWeight="bold" mt={1}>
                    {rapport.titre}
                  </Typography>

                  <Typography color="text.secondary">
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
                <Typography color="text.secondary">
                  Aucun rapport soumis
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ===== SOUTENANCE ===== */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6">📅 Soutenance</Typography>

              {soutenance ? (
                <Stack spacing={1} mt={1}>
                  <Typography>
                    <b>Date :</b>{" "}
                    {new Date(soutenance.date_debut).toLocaleString()}
                  </Typography>

                  <Typography>
                    <b>Salle :</b> {soutenance.salle || "—"}
                  </Typography>

                  <Chip label={soutenance.statut} color="info" />

                  {/* ✅ AJOUT JURY */}
                  <Divider sx={{ my: 1 }} />

                  <Typography fontWeight="bold">
                    👨‍🏫 Jury
                  </Typography>

                  {soutenance.jury && soutenance.jury.length > 0 ? (
                    soutenance.jury.map((j: any) => (
                      <Box
                        key={j.id}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          backgroundColor: "#F9FAFB",
                          p: 1.2,
                          borderRadius: 2,
                        }}
                      >
                        <Typography>{j.nom}</Typography>

                        <Chip
                          size="small"
                          label={
                            j.role === "president"
                              ? "Président"
                              : j.role === "supervisor"
                                ? "Encadrant"
                                : "Membre"
                          }
                        />
                      </Box>
                    ))
                  ) : (
                    <Typography color="text.secondary">
                      Jury non encore affecté
                    </Typography>
                  )}
                </Stack>
              ) : (
                <Typography color="text.secondary">
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
