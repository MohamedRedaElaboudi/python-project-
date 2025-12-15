import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerStudent } from "../../api/auth";

import {
  Box,
  Card,
  TextField,
  Typography,
  Button,
  InputAdornment,
  Divider,
  Chip,
  Alert,
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import SchoolIcon from "@mui/icons-material/School";
import BadgeIcon from "@mui/icons-material/Badge";
import PhoneIcon from "@mui/icons-material/Phone";

/* =======================
   VALIDATION HELPERS
   ======================= */
const isAcademicEmail = (email: string) =>
  /^[a-zA-Z0-9._%+-]+@edu\.uiz\.ac\.ma$/.test(email);

const isStrongPassword = (password: string) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(password);

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

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  /* =======================
     SUBMIT
     ======================= */
  const submit = async () => {
    if (!isAcademicEmail(form.email)) {
      alert("Veuillez utiliser votre email académique (@edu.uiz.ac.ma)");
      return;
    }

    if (!isStrongPassword(form.password)) {
      alert("Mot de passe non sécurisé");
      return;
    }

    try {
      await registerStudent(form);
      nav("/login");
    } catch {
      alert("Erreur lors de l'inscription étudiant");
    }
  };

  const isFormValid =
    isAcademicEmail(form.email) &&
    isStrongPassword(form.password) &&
    form.name &&
    form.prenom &&
    form.cin &&
    form.cne;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #EEF2FF, #F8FAFC)",
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

        {/* BADGE */}
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

        {/* ================= INFOS PERSONNELLES ================= */}
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

        {/* ================= EMAIL ================= */}
        <TextField
          fullWidth
          label="Email académique"
          margin="normal"
          error={Boolean(emailError)}
          helperText={
            emailError || "Format requis : prenom.nom@edu.uiz.ac.ma"
          }
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon color="primary" />
              </InputAdornment>
            ),
          }}
          onChange={(e) => {
            const value = e.target.value;
            setForm({ ...form, email: value });

            if (!isAcademicEmail(value)) {
              setEmailError("Email académique requis (@edu.uiz.ac.ma)");
            } else {
              setEmailError("");
            }
          }}
        />

        {/* ================= PASSWORD ================= */}
        <TextField
          fullWidth
          label="Mot de passe"
          type="password"
          margin="normal"
          error={Boolean(passwordError)}
          helperText={
            passwordError ||
            "Min. 8 caractères, majuscule, chiffre et symbole"
          }
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon color="primary" />
              </InputAdornment>
            ),
          }}
          onChange={(e) => {
            const value = e.target.value;
            setForm({ ...form, password: value });

            if (!isStrongPassword(value)) {
              setPasswordError(
                "Mot de passe faible (majuscule, chiffre, symbole requis)"
              );
            } else {
              setPasswordError("");
            }
          }}
        />

        {/* ================= INFOS ACADÉMIQUES ================= */}
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

        {/* ================= NOTATION ================= */}
        <Alert severity="info" sx={{ mt: 2 }}>
          <strong>Conditions d’inscription :</strong>
          <ul style={{ marginTop: 8 }}>
            <li>Email académique obligatoire : <b>@edu.uiz.ac.ma</b></li>
            <li>
              Mot de passe sécurisé :
              <ul>
                <li>Minimum 8 caractères</li>
                <li>1 majuscule, 1 chiffre, 1 symbole</li>
              </ul>
            </li>
          </ul>
        </Alert>

        {/* ================= BUTTON ================= */}
        <Button
          fullWidth
          variant="contained"
          sx={{
            mt: 3,
            py: 1.3,
            fontWeight: "bold",
            borderRadius: 3,
          }}
          disabled={!isFormValid}
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
