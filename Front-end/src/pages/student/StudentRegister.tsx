import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerStudent } from "../../api/auth";

import {
  Box,
  Card,
  Chip,
  Button,
  Divider,
  TextField,
  Typography,
  InputAdornment,
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import SchoolIcon from "@mui/icons-material/School";
import BadgeIcon from "@mui/icons-material/Badge";
import PhoneIcon from "@mui/icons-material/Phone";

export default function StudentRegister() {
  const nav = useNavigate();

  const [form, setForm] = useState({
    name: "",
    prenom: "",
    email: "",
    password: "",
    cin: "",
    cne: "",
    tel: "",
    filiere: "",
    niveau: "",
  });

  const submit = async () => {
    try {
      await registerStudent(form);
      nav("/login"); // ✅ retour login
    } catch {
      alert("Erreur lors de l'inscription étudiant");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #0D47A1, #1976D2, #42A5F5)", // 🔵 BLEU
      }}
    >
      <Card
        sx={{
          width: 460,
          p: 4,
          borderRadius: 5,
          boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
          background: "rgba(255,255,255,0.95)",
        }}
      >
        {/* LOGO */}
        <Box sx={{ textAlign: "center", mb: 1 }}>
          <img src="/assets/logo.png" alt="ENSIAS Logo" style={{ width: 160 }} />
        </Box>

        {/* BADGE ETUDIANT */}
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Chip
            icon={<SchoolIcon />}
            label="Inscription Étudiant"
            color="primary"
            sx={{ fontWeight: "bold", px: 1.5 }}
          />
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

        {/* ===== INFOS PERSONNELLES ===== */}
        <Typography variant="subtitle1" fontWeight="bold" mb={1}>
          Informations personnelles
        </Typography>

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

        {/* ===== INFOS ACADÉMIQUES ===== */}
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1" fontWeight="bold" mb={1}>
          Informations académiques
        </Typography>

        <TextField
          fullWidth
          label="CIN"
          margin="normal"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <BadgeIcon color="primary" />
              </InputAdornment>
            ),
          }}
          onChange={(e) => setForm({ ...form, cin: e.target.value })}
        />

        <TextField
          fullWidth
          label="CNE"
          margin="normal"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <BadgeIcon color="primary" />
              </InputAdornment>
            ),
          }}
          onChange={(e) => setForm({ ...form, cne: e.target.value })}
        />

        <TextField
          fullWidth
          label="Téléphone"
          margin="normal"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PhoneIcon color="primary" />
              </InputAdornment>
            ),
          }}
          onChange={(e) => setForm({ ...form, tel: e.target.value })}
        />

        {/* NIVEAU */}
        <TextField
          select
          fullWidth
          label="Niveau"
          margin="normal"
          SelectProps={{ native: true }}
          onChange={(e) => setForm({ ...form, niveau: e.target.value })}
        >
          <option value="">-- Sélectionner le niveau --</option>
          <option value="1ere annee">First year</option>
          <option value="2eme annee">2&egrave;me ann&eacute;e</option>
          <option value="3eme annee">3&egrave;me ann&eacute;e</option>
        </TextField>

        {/* FILIERE */}
        <TextField
          select
          fullWidth
          label="Filière"
          margin="normal"
          SelectProps={{ native: true }}
          onChange={(e) => setForm({ ...form, filiere: e.target.value })}
        >
          <option value="">-- Sélectionner la filière --</option>
          <option value="SITCN">
            Ingénierie spécialisée en Cybersécurité (SITCN)
          </option>
          <option value="IL">Développement Logiciel (IL)</option>
          <option value="MGSI">
            Management des Systèmes d'Information (MGSI)
          </option>
          <option value="SDBDIA">
            Sciences des Données, Big Data & IA (SDBDIA)
          </option>
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
          onClick={submit}
        >
          Créer compte étudiant
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
