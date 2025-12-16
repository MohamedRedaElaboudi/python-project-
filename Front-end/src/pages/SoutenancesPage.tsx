import React, { useState, useEffect, useMemo } from 'react';
import { TextField } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import WarningIcon from '@mui/icons-material/Warning';
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
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SchoolIcon from '@mui/icons-material/School';

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
    niveau: string;
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

interface Availability {
  filiere: string;
  date: string;
  students_total: number;
  students_with_soutenance: number;
  students_without_soutenance: number;
  total_slots: number;
  available_slots: number;
  total_teachers: number;
  available_teachers_estimate: number;
  total_salles: number;
  can_schedule: boolean;
}

// Définir les constantes de filières
const FILIERES = ['IL', 'MGSI', 'SDBDIA', 'SITCN'];
const NIVEAUX = ['1ère année', '2ème année', '3ème année'];

// Nouvelle structure simplifiée
interface GroupeFiliereNiveau {
  filiere: string;
  niveau: string;
  soutenances: Soutenance[];
}

const SoutenancePage: React.FC = () => {
  const [date, setDate] = useState<string>(() =>
    localStorage.getItem('soutenances_date') || ''
  );
  const [filiere, setFiliere] = useState<string>(() =>
    localStorage.getItem('soutenances_filiere') || 'IL'
  );
  const [niveau, setNiveau] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(false);
  const [soutenances, setSoutenances] = useState<Soutenance[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [soutenanceToDelete, setSoutenanceToDelete] = useState<number | null>(null);
  const [allSoutenances, setAllSoutenances] = useState<Soutenance[]>([]);

  const API_BASE = 'http://localhost:5000';

  // Récupérer les étudiants avec filtrage par niveau
  useEffect(() => {
    const fetchStudents = async () => {
      if (filiere) {
        try {
          let url = `${API_BASE}/api/soutenances/students?filiere=${filiere}`;
          if (date) url += `&date=${date}`;
          if (niveau) url += `&niveau=${niveau}`;

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
  }, [date, filiere, niveau]);

  // Récupérer les soutenances avec filtrage
  useEffect(() => {
    const fetchSoutenances = async () => {
      if (!date || !filiere) return;

      try {
        let url = `${API_BASE}/api/soutenances?date=${date}&filiere=${filiere}`;
        if (niveau) url += `&niveau=${niveau}`;

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setSoutenances(data);
        }
      } catch (err) {
        console.error('Erreur récupération soutenances:', err);
      }
    };

    fetchSoutenances();
  }, [date, filiere, niveau]);

  // Récupérer toutes les soutenances
  useEffect(() => {
    const fetchAllSoutenances = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/soutenances/all`);
        if (res.ok) {
          const data = await res.json();
          console.log('Données des soutenances:', data);
          setAllSoutenances(data);
        }
      } catch (e) {
        console.error('Erreur lors du chargement des soutenances:', e);
      }
    };

    fetchAllSoutenances();
  }, []);

  // Ajouter ces états
  const [studentsWithoutSoutenance, setStudentsWithoutSoutenance] = useState<Student[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    withSoutenance: 0,
    withoutSoutenance: 0
  });

  // Ajouter cet useEffect
  useEffect(() => {
    const fetchStudentsAndStats = async () => {
      if (filiere && niveau) {
        try {
          // URL pour récupérer les étudiants
          let studentsUrl = `${API_BASE}/api/soutenances/students-without?filiere=${filiere}`;
          if (niveau && niveau !== 'Tous les niveaux') {
            studentsUrl += `&niveau=${niveau}`;
          }
          if (date) {
            studentsUrl += `&date=${date}`;
          }

          // URL pour les statistiques
          let statsUrl = `${API_BASE}/api/soutenances/stats?filiere=${filiere}`;
          if (niveau && niveau !== 'Tous les niveaux') {
            statsUrl += `&niveau=${niveau}`;
          }
          if (date) {
            statsUrl += `&date=${date}`;
          }

          const [studentsResponse, statsResponse] = await Promise.all([
            fetch(studentsUrl),
            fetch(statsUrl)
          ]);

          if (studentsResponse.ok) {
            const studentsData = await studentsResponse.json();
            setStudentsWithoutSoutenance(studentsData);
          }

          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            setStats(statsData);
          }
        } catch (err) {
          console.error('Erreur récupération données:', err);
        }
      }
    };

    fetchStudentsAndStats();

    // Actualiser toutes les 15 secondes
    const interval = setInterval(fetchStudentsAndStats, 15000);

    return () => clearInterval(interval);
  }, [filiere, niveau, date]);

  // NOUVELLE FONCTION : Regroupement simplifié par filière et niveau
  const groupesParFiliereNiveau: GroupeFiliereNiveau[] = useMemo(() => {
    const map = new Map<string, Soutenance[]>();

    allSoutenances.forEach((s) => {
      const filieret = s.student.filiere || 'Filière non spécifiée';
      const niveaur = s.student.niveau?.trim() || 'Non spécifié';

      const key = `${filieret}__${niveaur}`;

      if (!map.has(key)) {
        map.set(key, []);
      }

      map.get(key)!.push(s);
    });

    return Array.from(map.entries()).map(([_, soutenancess]) => ({
      filiere: soutenancess[0].student.filiere || 'Filière non spécifiée',
      niveau: soutenancess[0].student.niveau?.trim() || 'Non spécifié',
      soutenances: soutenancess.sort(
        (a, b) =>
          a.date_soutenance.localeCompare(b.date_soutenance) ||
          a.heure_debut.localeCompare(b.heure_debut)
      ),
    }));
  }, [allSoutenances]);

  // Fonction pour formater l'affichage du niveau
  const formatNiveauDisplay = (niveauT: string): string => {
    if (!niveauT || niveauT === 'Non spécifié' || niveauT.trim() === '') {
      return 'Niveau non spécifié';
    }
    return niveauT;
  };

  // Fonction pour obtenir la couleur du niveau
  const getNiveauColor = (niveauH: string): string => {
    if (niveauH.includes('1ère') || niveauH.includes('1ere')) return '#4caf50'; // Vert
    if (niveauH.includes('2ème') || niveauH.includes('2eme')) return '#2196f3'; // Bleu
    if (niveauH.includes('3ème') || niveauH.includes('3eme')) return '#ff9800'; // Orange
    if (niveauH.includes('Master 1')) return '#9c27b0'; // Violet
    if (niveauH.includes('Master 2')) return '#f44336'; // Rouge
    return '#757575'; // Gris pour "Non spécifié"
  };

  const handleGenerate = async () => {
    if (!date || !filiere) {
      setError('Veuillez sélectionner une date et une filière');
      return;
    }

    if (!niveau) {
      setError('Veuillez sélectionner un niveau');
      return;
    }

    // Calculer les créneaux disponibles
    const calculateAvailableSlots = () => {
      const morningSlots = 16;
      const afternoonSlots = 16;
      return morningSlots + afternoonSlots;
    };

    const totalSlots = calculateAvailableSlots();
    const studentsCount = students.length;

    if (studentsCount > totalSlots) {
      setError(`Nombre d'étudiants (${studentsCount}) dépasse le nombre de créneaux disponibles (${totalSlots}). Veuillez choisir une autre date ou diviser sur plusieurs jours.`);
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`${API_BASE}/api/soutenances/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          filiere,
          niveau,
          start_time: '08:30',
          end_time: '18:30',
          duree_minutes: 15
        })
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(responseText);
      }

      const result = JSON.parse(responseText);
      setMessage(result.message || 'Soutenances générées');

      // Recharger toutes les données
      setTimeout(async () => {
        try {
          const [soutenancesRes, allRes, studentsRes] = await Promise.all([
            fetch(`${API_BASE}/api/soutenances?date=${date}&filiere=${filiere}&niveau=${niveau}`),
            fetch(`${API_BASE}/api/soutenances/all`),
            fetch(`${API_BASE}/api/soutenances/students?filiere=${filiere}&date=${date}&niveau=${niveau}`)
          ]);

          if (soutenancesRes.ok) {
            const soutenancesData = await soutenancesRes.json();
            setSoutenances(soutenancesData);
          }

          if (allRes.ok) setAllSoutenances(await allRes.json());
          if (studentsRes.ok) setStudents(await studentsRes.json());

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
      const response = await fetch(`${API_BASE}/api/soutenances/${soutenanceToDelete}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erreur lors de la suppression');
      }

      setSoutenances(soutenances.filter(s => s.id !== soutenanceToDelete));
      setAllSoutenances(allSoutenances.filter(s => s.id !== soutenanceToDelete));

      // Recharger les données
      const [studentsRes, allSoutenancesRes] = await Promise.all([
        fetch(`${API_BASE}/api/soutenances/students?filiere=${filiere}&date=${date}&niveau=${niveau}`),
        fetch(`${API_BASE}/api/soutenances/all`)
      ]);

      if (studentsRes.ok) setStudents(await studentsRes.json());
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Gestion des Soutenances
      </Typography>

      {/* Tabs pour basculer entre vue par niveau et vue générale */}
      <Paper sx={{ mb: 2 }}>
        <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
          <Tab label="Génération par niveau" />
          <Tab label="Vue globale des soutenances" />
        </Tabs>
      </Paper>

      {/* Vue génération par niveau */}
      {selectedTab === 0 && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Génération des soutenances par niveau
          </Typography>

          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'flex-end', mb: 3 }}>
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

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Niveau *</InputLabel>
              <Select
                value={niveau}
                label="Niveau *"
                onChange={(e) => setNiveau(e.target.value)}
              >
                <MenuItem value="">Tous les niveaux</MenuItem>
                {NIVEAUX.map((n) => (
                  <MenuItem key={n} value={n}>{n}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              onClick={handleGenerate}
              disabled={loading || !date || !filiere || !niveau}
              startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
              sx={{ height: 56 }}
            >
              {loading ? 'Génération...' : 'Générer les soutenances'}
            </Button>
          </Box>



          {/* Liste des étudiants du niveau sélectionné */}
          {niveau && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Étudiants {niveau} - {filiere}
              </Typography>

              {/* Statistiques dynamiques */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Chip
                  icon={<SchoolIcon />}
                  label={`${stats.totalStudents} étudiant(s)`}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label={`${stats.withSoutenance} avec soutenance`}
                  color="success"
                  variant="outlined"
                />
                <Chip
                  label={`${stats.withoutSoutenance} sans soutenance`}
                  color="warning"
                  variant="outlined"
                />
              </Box>

              {/* Tableau des étudiants */}
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Nom</strong></TableCell>
                    <TableCell><strong>CNE</strong></TableCell>
                    <TableCell><strong>Soutenance</strong></TableCell>
                    <TableCell><strong>Heure</strong></TableCell>
                    <TableCell><strong>Salle</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {studentsWithoutSoutenance.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.cne}</TableCell>
                      <TableCell>
                        <Chip
                          label={student.has_soutenance ? 'Planifiée' : 'Non planifiée'}
                          color={student.has_soutenance ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{student.soutenance_heure || '-'}</TableCell>
                      <TableCell>{student.soutenance_salle || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </Paper>
      )}

      {/* Vue globale des soutenances - VERSION MODIFIÉE */}
      {selectedTab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Toutes les soutenances planifiées
          </Typography>

          {groupesParFiliereNiveau.length === 0 ? (
            <Alert severity="info">Aucune soutenance planifiée</Alert>
          ) : (
            groupesParFiliereNiveau.map((groupe) => {
              const formattedNiveau = formatNiveauDisplay(groupe.niveau);
              const niveauColor = getNiveauColor(groupe.niveau);
              const totalSoutenances = groupe.soutenances.length;

              return (
                <Box key={`${groupe.filiere}-${groupe.niveau}`} sx={{ mb: 6 }}>
                  {/* En-tête de la filière et niveau */}
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                    p: 2,
                    backgroundColor: '#f0f7ff',
                    borderRadius: 2,
                    borderLeft: `4px solid ${niveauColor}`
                  }}>
                    <Box>
                      <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                        Filière : {groupe.filiere}
                      </Typography>
                      <Typography variant="h6" sx={{ color: niveauColor, mt: 1, display: 'flex', alignItems: 'center' }}>
                        <SchoolIcon sx={{ mr: 1, fontSize: 24 }} />
                        {formattedNiveau}
                        {groupe.niveau === 'Non spécifié' && (
                          <Tooltip title="Le niveau de ces étudiants n'est pas spécifié dans la base de données">
                            <WarningIcon sx={{ ml: 1, fontSize: 20, color: 'warning.main' }} />
                          </Tooltip>
                        )}
                      </Typography>
                    </Box>
                    <Chip
                      label={`${totalSoutenances} soutenance(s)`}
                      color="primary"
                      size="medium"
                      variant="outlined"
                    />
                  </Box>

                  {/* Tableau pour la filière/niveau */}
                  <Paper sx={{ mb: 4, border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f9f9f9' }}>
                          <TableCell sx={{ fontWeight: 'bold', width: '120px' }}>Date</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', width: '100px' }}>Heure</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', width: '200px' }}>Étudiant</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', width: '120px' }}>CNE</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', width: '100px' }}>Salle</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', width: '100px' }}>Statut</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', width: '250px' }}>Jury</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', width: '120px' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {groupe.soutenances.map((s) => (
                          <TableRow key={s.id} hover>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                {new Date(s.date_soutenance).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                })}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                {new Date(s.date_soutenance).toLocaleDateString('fr-FR', { weekday: 'short' })}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={s.heure_debut}
                                color="primary"
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                {s.student.name}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                {s.student.cne}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={s.salle || 'Non définie'}
                                size="small"
                                variant="outlined"
                                color="secondary"
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
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                {s.teachers.map((t) => (
                                  <Box key={t.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Typography variant="caption" sx={{
                                      fontWeight: t.role === 'president' ? 'bold' : 'normal',
                                      color: t.role === 'president' ? 'primary.main' : 'text.secondary'
                                    }}>
                                      {t.name}
                                    </Typography>
                                    {t.role === 'president' && (
                                      <Chip
                                        label="Président"
                                        size="small"
                                        color="primary"
                                        sx={{ fontSize: '0.6rem', height: '18px' }}
                                      />
                                    )}
                                  </Box>
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
                                sx={{ fontSize: '0.75rem' }}
                              >
                                Supprimer
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {/* Résumé en bas du tableau */}

                  </Paper>
                </Box>
              );
            })
          )}
        </Paper>
      )}

      {/* Messages d'erreur/succès */}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

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