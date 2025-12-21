import { useState } from "react";
import { loginUser } from "../api/auth";
import { useNavigate, useLocation } from "react-router-dom";

import {
  Box,
  Card,
  Button,
  Divider,
  TextField,
  Typography,
  InputAdornment,
} from "@mui/material";

import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";

export default function Login() {
  const nav = useNavigate();
  const location = useLocation();

  // 🔥 rôle attendu depuis ChooseRole
  const expectedRole = location.state?.role; // "student" | "staff" | undefined

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    try {
      const res = await loginUser({ email, password });

      const userRole = res.data.user.role;

      // 🔐 CONTRÔLE DE COHÉRENCE ROLE ↔ ESPACE
      if (expectedRole === "student" && userRole !== "student") {
        alert("Ce compte n'est pas un compte étudiant.");
        return;
      }

      if (
        expectedRole === "staff" &&
        userRole === "student"
      ) {
        alert("Ce compte étudiant ne peut pas accéder à cet espace.");
        return;
      }

      // 🔥 Sauvegarde token + rôle
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", userRole);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // 🔥 Redirection selon le rôle RÉEL
      switch (userRole) {
        case "student":
          nav("/student/dashboard");
          break;
        case "teacher":
          nav("/teacher/home");
          break;
        case "jury":
          nav("/jury/dashboard");
          break;

        case "admin":
          nav("/app");
          break;
        default:
          nav("/");
      }
    } catch {
      alert("Email ou mot de passe incorrect");
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #EEF2FF, #F8FAFC)",
      }}
    >
      <Card
        sx={{
          width: 420,
          p: 4,
          borderRadius: 5,
          boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
          background: "rgba(255,255,255,0.9)",
        }}
      >

        {/* LOGO */}
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <img src="/assets/logo.png" alt="ENSIAS Logo" style={{ width: 180 }} />
        </Box>

        <Typography
          variant="h6"
          textAlign="center"
          fontWeight="bold"
          color="primary"
        >
          École Nationale Supérieure de l’Intelligence Artificielle
        </Typography>

        <Typography textAlign="center" mb={1} fontSize="14px">
          Université Ibn Zohr – Taroudant
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography
          variant="h4"
          mb={2}
          textAlign="center"
          sx={{ fontWeight: 600 }}
        >
          Connexion
        </Typography>

        {/* EMAIL */}
        <TextField
          fullWidth
          label="Email"
          margin="normal"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon color="primary" />
              </InputAdornment>
            ),
            sx: { borderRadius: 3 },
          }}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* PASSWORD */}
        <TextField
          fullWidth
          type="password"
          label="Mot de passe"
          margin="normal"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon color="primary" />
              </InputAdornment>
            ),
            sx: { borderRadius: 3 },
          }}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button
          fullWidth
          variant="contained"
          sx={{
            mt: 3,
            py: 1.3,
            fontWeight: "bold",
            borderRadius: 3,
          }}
          onClick={login}
        >
          Se connecter
        </Button>

        <Typography textAlign="center" mt={2}>
          Pas de compte ?{" "}
          <a href="/register" style={{ color: "#1565C0", fontWeight: 600 }}>
            Créer un compte
          </a>
        </Typography>
      </Card>
    </Box>
  );
}
