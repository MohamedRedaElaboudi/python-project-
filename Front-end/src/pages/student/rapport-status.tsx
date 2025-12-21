import { useState, useEffect } from "react";
import {
  Box,
  Card,
  Chip,
  Typography,
  CardContent,
} from "@mui/material";

const API_BASE = "http://localhost:5000/api/v1";

/**
 * 🎯 Mapping PRO des statuts
 * Le backend décide, le frontend affiche
 */
const getStatusConfig = (status: string) => {
  switch (status) {
    case "UPLOADED":
      return { label: "Déposé", color: "info" };
    case "ANALYSING":
      return { label: "Analyse en cours", color: "warning" };
    case "VALIDATED":
      return { label: "Validé", color: "success" };
    case "REJECTED":
      return { label: "Refusé", color: "error" };
    default:
      return { label: "Inconnu", color: "default" };
  }
};

export default function RapportStatus() {
  const [rapport, setRapport] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_BASE}/student/dashboard`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setRapport(data.rapport))
      .catch(() => setRapport(null));
  }, []);

  if (!rapport) {
    return <Typography>Aucun rapport trouvé</Typography>;
  }

  const statusConfig = getStatusConfig(rapport.status);

  return (
    <Card sx={{ maxWidth: 600, borderRadius: 3, boxShadow: 4 }}>
      <CardContent>
        <Typography variant="h5" mb={2}>
          📊 Suivi du Rapport
        </Typography>

        <Box mb={1}>
          <b>Titre :</b> {rapport.titre}
        </Box>

        <Box mb={1}>
          <b>Statut :</b>{" "}
          <Chip
            label={statusConfig.label}
            color={statusConfig.color as any}
          />
        </Box>

        <Box>
          <b>Date :</b>{" "}
          {rapport.created_at
            ? new Date(rapport.created_at).toLocaleDateString()
            : "—"}
        </Box>
      </CardContent>
    </Card>
  );
}

