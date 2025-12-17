import { Box, Card, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

// ⚠️ Mets tes vraies images ici
import studentIcon from "../assets/student.png";
import staffIcon from "../assets/user.png";
import schoolLogo from "../assets/logo.png";

export default function ChooseRole() {
  const nav = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #EEF2FF, #F8FAFC)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      {/* ===== LOGO ECOLE ===== */}
      <Box mb={6} textAlign="center">
        <img
          src={schoolLogo}
          alt="School Logo"
          style={{ height: 80, marginBottom: 12 }}
        />
        <Typography variant="h4" fontWeight="bold">
          Plateforme de Gestion des Soutenances
        </Typography>
        <Typography color="text.secondary">
          Choisissez votre espace
        </Typography>
      </Box>

      {/* ===== CARDS ===== */}
      <Box
        sx={{
          display: "flex",
          gap: 4,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {/* ================= ETUDIANT ================= */}
        <Card
          sx={{
            width: 300,
            p: 4,
            textAlign: "center",
            borderRadius: 4,
            cursor: "pointer",
            transition: "0.3s",
            "&:hover": {
              transform: "translateY(-6px)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
            },
          }}
          onClick={() => nav("/login", { state: { role: "student" } })}
        >
          <img
            src={studentIcon}
            alt="Étudiant"
            style={{ height: 110, marginBottom: 16 }}
          />

          <Typography variant="h6" fontWeight="bold" mb={1}>
            Espace Étudiant
          </Typography>

          <Typography color="text.secondary" mb={3}>
            Dépôt de rapport, suivi et soutenance
          </Typography>

          <Button
            fullWidth
            variant="contained"
            sx={{ mb: 1 }}
            onClick={(e) => {
              e.stopPropagation();
              nav("/login", { state: { role: "student" } });
            }}
          >
            Se connecter
          </Button>

          <Button
            fullWidth
            variant="outlined"
            onClick={(e) => {
              e.stopPropagation();
              nav("/register/student");
            }}
          >
            Créer un compte
          </Button>
        </Card>

        {/* ================= AUTRES ROLES ================= */}
        <Card
          sx={{
            width: 300,
            p: 4,
            textAlign: "center",
            borderRadius: 4,
            cursor: "pointer",
            transition: "0.3s",
            "&:hover": {
              transform: "translateY(-6px)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
            },
          }}
          onClick={() => nav("/login", { state: { role: "staff" } })}
        >
          <img
            src={staffIcon}
            alt="Staff"
            style={{ height: 110, marginBottom: 16 }}
          />

          <Typography variant="h6" fontWeight="bold" mb={1}>
            Admin / Enseignant
          </Typography>

          <Typography color="text.secondary" mb={3}>
            Validation, planification et évaluation
          </Typography>

          <Button
            fullWidth
            variant="contained"
            sx={{ mb: 1 }}
            onClick={(e) => {
              e.stopPropagation();
              nav("/login", { state: { role: "staff" } });
            }}
          >
            Se connecter
          </Button>

          <Button
            fullWidth
            variant="outlined"
            onClick={(e) => {
              e.stopPropagation();
              nav("/register");
            }}
          >
            Créer un compte
          </Button>
        </Card>
      </Box>
    </Box>
  );
}
