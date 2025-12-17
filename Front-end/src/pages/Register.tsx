import { useState } from "react";
import { registerUser } from "../api/auth";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Card,
  TextField,
  Typography,
  Button,
  InputAdornment,
  Divider,
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

export default function Register() {
  const nav = useNavigate();

  // 🔥 PAS DE ROLE "student" ICI
  const [form, setForm] = useState({
    name: "",
    prenom: "",
    email: "",
    password: "",
    role: "teacher", // valeur par défaut NON étudiant
  });

  const register = async () => {
    try {
      await registerUser(form);

      // ✅ REDIRECTION DIRECTE VERS LOGIN
      nav("/login");
    } catch {
      alert("Erreur lors de l'inscription");
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
          width: 450,
          p: 4,
          borderRadius: 5,
          boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(6px)",
        }}
      >
        {/* LOGO */}
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <img
            src="/assets/logo.png"
            alt="ENSIAS Logo"
            style={{ width: 180 }}
          />
        </Box>

        {/* TITRE */}
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
          fontWeight="bold"
        >
          Créer un compte (Personnel)
        </Typography>

        {/* NOM */}
        <TextField
          fullWidth
          label="Nom"
          margin="normal"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon color="primary" />
              </InputAdornment>
            ),
          }}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        {/* PRENOM */}
        <TextField
          fullWidth
          label="Prénom"
          margin="normal"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon color="primary" />
              </InputAdornment>
            ),
          }}
          onChange={(e) => setForm({ ...form, prenom: e.target.value })}
        />

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
          }}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        {/* PASSWORD */}
        <TextField
          fullWidth
          label="Mot de passe"
          type="password"
          margin="normal"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon color="primary" />
              </InputAdornment>
            ),
          }}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        {/* ROLE (SANS ÉTUDIANT) */}
        <TextField
          select
          fullWidth
          label="Rôle"
          value={form.role}
          margin="normal"
          SelectProps={{ native: true }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AccountCircleIcon color="primary" />
              </InputAdornment>
            ),
          }}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="teacher">Enseignant</option>
          <option value="admin">Administrateur</option>
        </TextField>

        {/* BOUTON */}
        <Button
          fullWidth
          variant="contained"
          sx={{
            mt: 3,
            py: 1.3,
            fontWeight: "bold",
            borderRadius: 3,
          }}
          onClick={register}
        >
          S'inscrire
        </Button>

        <Typography textAlign="center" mt={2}>
          Déjà inscrit ?{" "}
          <a href="/login" style={{ color: "#1565C0", fontWeight: 600 }}>
            Connexion
          </a>
        </Typography>
      </Card>
    </Box>
  );
}
