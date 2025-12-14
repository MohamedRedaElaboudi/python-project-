import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Divider,
  Alert,
  Stack,
} from "@mui/material";

const API_BASE = "http://localhost:5000/api/v1";

type JuryMember = {
  id: number;
  nom: string;
  role: "president" | "member" | "supervisor";
};

type Soutenance = {
  date_debut: string;
  duree_minutes: number;
  salle: string | null;
  statut: "planned" | "done" | "cancelled";
  jury: JuryMember[];
};

export default function StudentSoutenance() {
  const [soutenance, setSoutenance] = useState<Soutenance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/student/soutenance`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setSoutenance(data))
      .catch(() => setSoutenance(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Typography>Chargement...</Typography>;
  }

  if (!soutenance) {
    return (
      <Alert severity="info">
        Aucune soutenance n’est encore planifiée pour vous.
      </Alert>
    );
  }

  const getStatusLabel = (statut: string) => {
    switch (statut) {
      case "planned":
        return "Planifiée";
      case "done":
        return "Terminée";
      case "cancelled":
        return "Annulée";
      default:
        return statut;
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case "planned":
        return "info";
      case "done":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const date = new Date(soutenance.date_debut);

  return (
    <Box maxWidth={750} mx="auto">
      <Typography variant="h4" fontWeight="bold" mb={3}>
        🎓 Détails de la Soutenance
      </Typography>

      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Stack spacing={3}>
            {/* ================= INFOS ================= */}
            <Typography variant="h6">📅 Informations Générales</Typography>
            <Divider />

            <Typography>
              <strong>Date :</strong> {date.toLocaleDateString()}
            </Typography>

            <Typography>
              <strong>Heure :</strong>{" "}
              {date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Typography>

            <Typography>
              <strong>Durée :</strong> {soutenance.duree_minutes} minutes
            </Typography>

            <Typography>
              <strong>Salle :</strong> {soutenance.salle || "—"}
            </Typography>

            <Chip
              label={getStatusLabel(soutenance.statut)}
              color={getStatusColor(soutenance.statut)}
              sx={{ width: "fit-content" }}
            />

            {/* ================= JURY ================= */}
            <Divider />
            <Typography variant="h6">👨‍🏫 Jury</Typography>

            {soutenance.jury && soutenance.jury.length > 0 ? (
              <Stack spacing={1}>
                {soutenance.jury.map((j) => (
                  <Box
                    key={j.id}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: "#F9FAFB",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography fontWeight="bold">
                      {j.nom}
                    </Typography>

                    <Chip
                      size="small"
                      label={
                        j.role === "president"
                          ? "Président"
                          : j.role === "supervisor"
                          ? "Encadrant"
                          : "Membre"
                      }
                      color={
                        j.role === "president"
                          ? "primary"
                          : j.role === "supervisor"
                          ? "success"
                          : "default"
                      }
                    />
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography color="text.secondary">
                Jury non encore affecté
              </Typography>
            )}

            {/* ================= INFO ================= */}
            <Divider />
            <Alert severity="info">
              Merci de vous présenter 15 minutes avant l’heure prévue,
              muni de votre carte étudiante.
            </Alert>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
