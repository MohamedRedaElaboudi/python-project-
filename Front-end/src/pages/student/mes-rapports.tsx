import { useState, useEffect } from "react";
import {
  Box,
  Card,
  Chip,
  Stack,
  Button,
  Typography,
  CardContent,
} from "@mui/material";

const API_BASE = "http://localhost:5000/api/v1";

type Rapport = {
  id: number;
  titre: string;
  status: "uploaded" | "validated" | "rejected";
  created_at: string;
};

export default function MesRapports() {
  const [rapports, setRapports] = useState<Rapport[]>([]);
  const [loading, setLoading] = useState(true);

  /* =======================
     FETCH RAPPORTS
     ======================= */
  useEffect(() => {
    fetch(`${API_BASE}/student/rapports`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then(setRapports)
      .catch(() => setRapports([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Typography>Chargement...</Typography>;
  if (rapports.length === 0)
    return <Typography>Aucun rapport trouvé</Typography>;

  /* =======================
     STATUS HELPERS
     ======================= */
  const getStatusLabel = (status: string) => {
      switch (status) {
        case "uploaded":
          return "En cours";
        case "validated":
          return "Validé";
        case "rejected":
          return "Refusé";
        default:
          return "Inconnu";
      }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case "validated":
        return "success";
      case "rejected":
        return "error";
      default:
        return "warning";
    }
  };

  /* =======================
     PDF ACTIONS
     ======================= */
  const downloadRapport = async (rapportId: number) => {
    const res = await fetch(
      `${API_BASE}/rapports/download/${rapportId}`,
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

  const viewRapport = async (rapportId: number) => {
    const res = await fetch(
      `${API_BASE}/rapports/download/${rapportId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  /* =======================
     RENDER
     ======================= */
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        📂 Mes Rapports
      </Typography>

      <Stack spacing={3}>
        {rapports.map((rapport) => (
          <Card
            key={rapport.id}
            sx={{
              borderRadius: 3,
              backgroundColor: "#F9FAFB",
              boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
              transition: "0.2s",
              "&:hover": {
                boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
              },
            }}
          >
            <CardContent>
              {/* HEADER */}
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={1}
              >
                <Typography variant="h6" fontWeight="bold">
                  📄 {rapport.titre}
                </Typography>

                <Chip
                  label={getStatusLabel(rapport.status)}
                  color={getStatusColor(rapport.status)}
                />
              </Box>

              {/* DATE */}
              <Typography variant="body2" color="text.secondary">
                Date :{" "}
                {new Date(rapport.created_at).toLocaleDateString()}
              </Typography>

              {/* ACTIONS */}
              <Box
                mt={3}
                display="flex"
                justifyContent="flex-end"
                gap={2}
              >
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => viewRapport(rapport.id)}
                >
                  👁️ Voir
                </Button>

                <Button
                  variant="contained"
                  size="small"
                  onClick={() => downloadRapport(rapport.id)}
                >
                  ⬇️ Télécharger
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
