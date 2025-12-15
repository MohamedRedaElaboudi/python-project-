import React, { useState, useEffect } from 'react';
import { TextField } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';

import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

interface Jury {
  id: number;
  name: string;
  role: string;
}

interface Soutenance {
  id: number;
  heure_debut: string;
  date_soutenance: string;
  salle: string;
  salle_id: number;
  student: {
    id: number;
    name: string;
    cne: string;
    filiere: string;
  };
  teachers: Jury[];
  statut: string;
}

interface Student {
  id: number;
  name: string;
  cne: string;
  filiere: string;
  niveau: string;
  has_soutenance: boolean;
  soutenance_heure: string | null;
  soutenance_salle: string | null;
}

// Ajoutez cette interface
interface Availability {
  filiere: string;
  date: string;
  students_total: number;
  students_with_soutenance: number;
  students_without_soutenance: number;
  total_slots: number;
  available_slots: number;
  total_teachers: number;
  available_teachers_estimate: number;  // Nouveau
  total_salles: number;
  can_schedule: boolean;
}

const FILIERES = ['IL', 'MGSI', 'SDBDIA', 'SITCN'];

const SoutenancePage: React.FC = () => {
  const [date, setDate] = useState<string>(() =>
  localStorage.getItem('soutenances_date') || ''
);

const [filiere, setFiliere] = useState<string>(() =>
  localStorage.getItem('soutenances_filiere') || 'IL'
);

  const [loading, setLoading] = useState<boolean>(false);
  const [soutenances, setSoutenances] = useState<Soutenance[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [soutenanceToDelete, setSoutenanceToDelete] = useState<number | null>(null);
  const [allSoutenances, setAllSoutenances] = useState<Soutenance[]>([]);

  // Récupérer la disponibilité quand la date ou la filière change
  useEffect(() => {
    const fetchAvailability = async () => {
      if (date && filiere) {
        try {
          const response = await fetch(
            `/api/soutenances/availability?date=${date}&filiere=${filiere}`
          );
          if (response.ok) {
            const data = await response.json();
            setAvailability(data);
          }
        } catch (err) {
          console.error('Erreur récupération disponibilité:', err);
        }
      }
    };

    fetchAvailability();
  }, [date, filiere]);

  useEffect(() => {
  const fetchAllSoutenances = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/soutenances/all`);
      if (res.ok) {
        setAllSoutenances(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  fetchAllSoutenances();
}, []);

  // Récupérer les étudiants quand la date ou la filière change
  useEffect(() => {
    const fetchStudents = async () => {
      if (filiere) {
        try {
          const url = `/api/soutenances/students?filiere=${filiere}${date ? `&date=${date}` : ''}`;
          const response = await fetch(url);
          if (response.ok) {
            const data = await response.json();
            setStudents(data);
          }
        } catch (err) {
          console.error('Erreur récupération étudiants:', err);
        }
      }
    };

    fetchStudents();
  }, [date, filiere]);
const API_BASE = 'http://localhost:5000';
// Ajoutez cette fonction pour vérifier la cohérence
const checkConsistency = (soutenancesT: Soutenance[]) => {
  if (soutenancesT.length === 0) return { isConsistent: true, message: '' };

  const first = soutenancesT[0];
  const sameSalle = soutenancesT.every(s => s.salle_id === first.salle_id);
  const sameTeachers = soutenancesT.every(s =>
    JSON.stringify(s.teachers.sort((a, b) => a.id - b.id)) ===
    JSON.stringify(first.teachers.sort((a, b) => a.id - b.id))
  );

  if (sameSalle && sameTeachers) {
    return {
      isConsistent: true,
      message: `Toutes les soutenances ont le même jury et la même salle (${first.salle})`
    };
  }

  return {
    isConsistent: false,
    message: 'Les soutenances ont des jurys ou salles différents'
  };
};
  useEffect(() => {
  if (date) localStorage.setItem('soutenances_date', date);
  if (filiere) localStorage.setItem('soutenances_filiere', filiere);
}, [date, filiere]);

  // Récupérer les soutenances quand la date ou la filière change
 useEffect(() => {
  const fetchSoutenances = async () => {
    if (!date || !filiere) return;

    try {
      const response = await fetch(
        `${API_BASE}/api/soutenances?date=${date}&filiere=${filiere}`
      );

      if (response.ok) {
        const data = await response.json();
        setSoutenances(data);
      }
    } catch (err) {
      console.error('Erreur récupération soutenances:', err);
    }
  };

  fetchSoutenances();
}, [date, filiere]);


  const handleGenerate = async () => {
  if (!date || !filiere) {
    setError('Veuillez sélectionner une date et une filière');
    return;
  }

  // Calculer le nombre de créneaux disponibles
  const calculateAvailableSlots = () => {
    const morningSlots = 16;
    const afternoonSlots = 16;
    return morningSlots + afternoonSlots;
  };

  const totalSlots = calculateAvailableSlots();
  const studentsCount = students.length;

  console.log(`Étudiants: ${studentsCount}, Créneaux disponibles: ${totalSlots}`);

  if (studentsCount > totalSlots) {
    setError(`Nombre d'étudiants (${studentsCount}) dépasse le nombre de créneaux disponibles (${totalSlots}). Veuillez choisir une autre date ou diviser sur plusieurs jours.`);
    return;
  }

  // Vérifier la disponibilité des enseignants
  if (availability && availability.available_teachers_estimate < 3) {
    setError(`Nombre insuffisant d'enseignants disponibles (${availability.available_teachers_estimate}). Minimum 3 requis.`);
    return;
  }

  setLoading(true);
  setError(null);
  setMessage(null);

  try {
    console.log('Envoi de la requête de génération...');
    const response = await fetch(`${API_BASE}/api/soutenances/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date,
        filiere,
        start_time: '08:30',
        end_time: '18:30',
        duree_minutes: 15
      })
    });

    const responseText = await response.text();
    console.log('Réponse reçue:', responseText);

    if (!response.ok) {
      throw new Error(responseText);
    }

    const result = JSON.parse(responseText);
    console.log('Résultat parsé:', result);

    setMessage(result.message || 'Soutenances générées');

    // Recharger toutes les données
    setTimeout(async () => {
      try {
        const [soutenancesRes, allRes, studentsRes, availabilityRes] = await Promise.all([
          fetch(`${API_BASE}/api/soutenances?date=${date}&filiere=${filiere}`),
          fetch(`${API_BASE}/api/soutenances/all`),
          fetch(`${API_BASE}/api/soutenances/students?filiere=${filiere}&date=${date}`),
          fetch(`${API_BASE}/api/soutenances/availability?date=${date}&filiere=${filiere}`)
        ]);

        if (soutenancesRes.ok) {
          const soutenancesData = await soutenancesRes.json();
          console.log(`Soutenances chargées: ${soutenancesData.length}`);
          setSoutenances(soutenancesData);
        }

        if (allRes.ok) setAllSoutenances(await allRes.json());
        if (studentsRes.ok) setStudents(await studentsRes.json());
        if (availabilityRes.ok) setAvailability(await availabilityRes.json());

      } catch (reloadErr) {
        console.error('Erreur lors du rechargement:', reloadErr);
      }
    }, 1000);

  } catch (err: any) {
    console.error('Erreur lors de la génération:', err);
    setError(err.message || 'Erreur lors de la génération des soutenances');
  } finally {
    setLoading(false);
  }
};


  const handleDeleteClick = (id: number) => {
    setSoutenanceToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
  if (!soutenanceToDelete) return;

  try {
    // Corrigez l'URL pour utiliser API_BASE
    const response = await fetch(`${API_BASE}/api/soutenances/${soutenanceToDelete}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Erreur lors de la suppression');
    }

    // Mettre à jour toutes les listes
    setSoutenances(soutenances.filter(s => s.id !== soutenanceToDelete));
    setAllSoutenances(allSoutenances.filter(s => s.id !== soutenanceToDelete));

    // Recharger toutes les données
    const [studentsRes, availabilityRes, allSoutenancesRes] = await Promise.all([
      fetch(`${API_BASE}/api/soutenances/students?filiere=${filiere}&date=${date}`),
      fetch(`${API_BASE}/api/soutenances/availability?date=${date}&filiere=${filiere}`),
      fetch(`${API_BASE}/api/soutenances/all`)
    ]);

    if (studentsRes.ok) setStudents(await studentsRes.json());
    if (availabilityRes.ok) setAvailability(await availabilityRes.json());
    if (allSoutenancesRes.ok) setAllSoutenances(await allSoutenancesRes.json());

    setMessage('Soutenance supprimée avec succès');

  } catch (err: any) {
    console.error('Erreur suppression:', err);
    setError(err.message || 'Erreur lors de la suppression');
  } finally {
    setDeleteDialogOpen(false);
    setSoutenanceToDelete(null);
  }
};

   const soutenancesParFiliere = allSoutenances.reduce((acc, s) => {
  const filiereT = s.student.filiere || 'Autre';
  if (!acc[filiereT]) acc[filiereT] = [];
  acc[filiereT].push(s);
  return acc;
}, {} as Record<string, Soutenance[]>);


  // Calculer les statistiques
  const studentsWithSoutenance = students.filter(s => s.has_soutenance).length;
  const studentsWithoutSoutenance = students.filter(s => !s.has_soutenance).length;



  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Gestion des Soutenances
      </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
  <Chip
    label={`${allSoutenances.length} soutenance(s) planifiée(s)`}
    color="primary"
    variant="outlined"
    sx={{ mr: 2 }}
  />
  <Chip
    label={`${Object.keys(soutenancesParFiliere).length} filière(s)`}
    color="secondary"
    variant="outlined"
  />
       </Box>



      {/* Paramètres */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Paramètres de génération
        </Typography>

        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <TextField
              label="Date des soutenances"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
              fullWidth
            />
          </FormControl>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filière *</InputLabel>
            <Select
              value={filiere}
              label="Filière *"
              onChange={(e) => setFiliere(e.target.value)}
            >
              {FILIERES.map((f) => (
                <MenuItem key={f} value={f}>{f}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            onClick={handleGenerate}
            disabled={loading || !date || !filiere}
            startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
            sx={{ height: 56 }}
          >
            {loading ? 'Génération...' : 'Générer les soutenances'}
          </Button>
        </Box>

        {availability && !availability.can_schedule && date && filiere && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {availability.students_without_soutenance === 0
              ? 'Tous les étudiants ont déjà une soutenance à cette date'
              : availability.available_slots === 0
              ? 'Aucun créneau disponible pour cette date'
              : 'Impossible de planifier de nouvelles soutenances'}
          </Alert>
        )}
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}



      {/* Liste des soutenances générées */}


{/* Liste des soutenances planifiées */}
<Paper sx={{ p: 3 }}>
  <Typography variant="h6" gutterBottom>
    Toutes les soutenances planifiées
  </Typography>

  {Object.keys(soutenancesParFiliere).length === 0 ? (
    <Alert severity="info">Aucune soutenance planifiée à venir</Alert>
  ) : (
    Object.entries(soutenancesParFiliere).map(([filiereName, souts]) => (
      <Box key={filiereName} sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 1, color: 'primary.main' }}>
          Filière : {filiereName}
        </Typography>

        {/* Regrouper par date */}
        {Object.entries(
          souts.reduce((acc, s) => {
  const dateKey = s.date_soutenance || 'Date inconnue';
  if (!acc[dateKey]) acc[dateKey] = [];
  acc[dateKey].push(s);
  return acc;
}, {} as Record<string, Soutenance[]>)

        ).map(([dateStr, soutsByDate]) => (
          <Box key={dateStr} sx={{ mb: 3, ml: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Date : {new Date(dateStr).toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Typography>

            <Table size="small" sx={{ border: '1px solid #e0e0e0' }}>

                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Heure</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell> {/* Nouvelle colonne */}
                    <TableCell sx={{ fontWeight: 'bold' }}>Étudiant</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>CNE</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Salle</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Statut</TableCell> {/* Nouvelle colonne */}
                    <TableCell sx={{ fontWeight: 'bold' }}>Jury</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>

              <TableBody>
                {soutsByDate.sort((a, b) => a.heure_debut.localeCompare(b.heure_debut)).map(s => (
                  <TableRow key={s.id} hover>
                      <TableCell>
                        <Chip
                          label={s.heure_debut}
                          color="primary"
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(s.date_soutenance).toLocaleDateString('fr-FR')}
                      </TableCell>
              <TableCell>{s.student.name}</TableCell>
              <TableCell>{s.student.cne}</TableCell>
              <TableCell>
                <Chip
                  label={s.salle || 'Non définie'}
                  size="small"
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={s.statut || 'planned'}
                  size="small"
                  color={
                    s.statut === 'done' ? 'success' :
                    s.statut === 'cancelled' ? 'error' : 'warning'
                  }
                  variant="outlined"
                />
              </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {s.teachers.map((t: Jury) => (
                          <Tooltip key={t.id} title={`${t.role}`}>
                            <Chip
                              label={t.name}
                              size="small"
                              sx={{
                                mr: 0.5,
                                mb: 0.5,
                                bgcolor: t.role === 'president' ? '#e3f2fd' : '#f5f5f5'
                              }}
                            />
                          </Tooltip>
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Button
                        color="error"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteClick(s.id)}
                        variant="outlined"
                      >
                        Supprimer
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        ))}
      </Box>
    ))
  )}
</Paper>



      {/* Dialog de confirmation suppression */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer cette soutenance ?
            Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SoutenancePage;