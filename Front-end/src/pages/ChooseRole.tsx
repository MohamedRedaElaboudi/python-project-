import { Box, Card, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function ChooseRole() {
  const nav = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 4,
        background: "#f5f7fb",
      }}
    >
      {/* ================= ETUDIANT ================= */}
      <Card sx={{ p: 3, width: 260, textAlign: "center" }}>
        <Typography variant="h6" mb={2}>
          Étudiant
        </Typography>

        <Button
          fullWidth
          variant="contained"
          sx={{ mb: 1 }}
          onClick={() => nav("/login", { state: { role: "student" } })}
        >
          Se connecter
        </Button>

        <Button
          fullWidth
          variant="outlined"
          onClick={() => nav("/register/student")}
        >
          Créer un compte
        </Button>
      </Card>

      {/* ================= AUTRES ROLES ================= */}
      <Card sx={{ p: 3, width: 260, textAlign: "center" }}>
        <Typography variant="h6" mb={2}>
          Admin / Enseignant / Jury
        </Typography>

        <Button
          fullWidth
          variant="contained"
          sx={{ mb: 1 }}
          onClick={() => nav("/login", { state: { role: "staff" } })}
        >
          Se connecter
        </Button>

        <Button
          fullWidth
          variant="outlined"
          onClick={() => nav("/register")}
        >
          Créer un compte
        </Button>
      </Card>
    </Box>
  );
}
