import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import {
  Eye,
  Search,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
} from "lucide-react"

import {
  Box,
  Card,
  Chip,
  Grid,
  Table,
  Paper,
  Stack,
  Select,
  Divider,
  TableRow,
  MenuItem,
  useTheme,
  TextField,
  TableBody,
  TableCell,
  TableHead,
  CardHeader,
  Typography,
  InputLabel,
  IconButton,
  CardContent,
  FormControl,
  TableContainer,
  InputAdornment,
  TablePagination,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material"

// Interface pour la structure des données reçues du backend
interface AnalysisData {
  id: number | null  // Can be null for reports without analysis
  rapportId: number  // Always present
  analyzedAt: string | null
  juryAssigned: string[]
  level: string
  originalityScore: number
  rapportName: string
  riskLevel: 'low' | 'medium' | 'high' | 'none' | string
  similarityScore: number
  sourcesCount: number
  specialty: string
  status: 'pending' | 'completed' | string
  studentId: number
  studentMatricule: string
  studentName: string
  studentPrenom: string
  totalMatches: number
}

// Interface pour la structure utilisée dans le composant React
interface MappedAnalysis {
  id: number | null  // Can be null for reports without analysis
  rapportId: number  // Always present
  studentName: string
  studentMatricule: string
  specialty: string
  level: string
  similarityScore: number
  originalityScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'none' | string
  analyzedAt: string | null
  rapportName: string
  juryAssigned: string[]
  status: 'pending' | 'completed' | string
}


export function DashboardPlagiat() {
  const navigate = useNavigate()
  const theme = useTheme()

  const [analyses, setAnalyses] = useState<MappedAnalysis[]>([])
  const [search, setSearch] = useState("")
  const [filterRisk, setFilterRisk] = useState("all")

  // Pagination
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Auto-analyze state
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)

  // Fetch data from backend
  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        // CORRECTION 1: Appel de l'endpoint /dashboard qui retourne le tableau complet
        const response = await axios.get<AnalysisData[]>(
          "http://localhost:5000/api/plagiat/dashboard"
        )

        // CORRECTION 2: Mappage direct de la réponse (response.data est le tableau)
        const mapped: MappedAnalysis[] = response.data.map((a: AnalysisData) => ({
          id: a.id,  // Can be null
          rapportId: a.rapportId,  // Always present
          // Utilisation des clés studentPrenom et studentName pour former le nom complet
          studentName: `${a.studentPrenom} ${a.studentName}`,
          // Utilisation des clés exactes du JSON
          studentMatricule: a.studentMatricule,
          specialty: a.specialty,
          level: a.level,
          similarityScore: a.similarityScore || 0,
          originalityScore: a.originalityScore || 0,
          riskLevel: a.riskLevel?.toLowerCase() || 'none',
          // Le backend fournit déjà analyzedAt au format ISO
          analyzedAt: a.analyzedAt,
          rapportName: a.rapportName,
          juryAssigned: a.juryAssigned || [],
          status: a.status || 'pending',
        }))
        setAnalyses(mapped)
      } catch (error) {
        console.error("Erreur lors de la récupération des analyses :", error)
      }
    }
    fetchAnalyses()
  }, [])

  // Function to trigger automatic analysis of all pending reports
  const handleAutoAnalyze = async () => {
    setIsAnalyzing(true)
    setAnalyzeError(null)

    try {
      const response = await axios.post(
        "http://localhost:5000/api/plagiat/analyze_all_pending"
      )

      setShowSuccess(true)

      // Refresh the analyses after a delay to allow backend processing
      setTimeout(async () => {
        const refreshResponse = await axios.get<AnalysisData[]>(
          "http://localhost:5000/api/plagiat/dashboard"
        )
        const mapped: MappedAnalysis[] = refreshResponse.data.map((a: AnalysisData) => ({
          id: a.id,
          rapportId: a.rapportId,
          studentName: `${a.studentPrenom} ${a.studentName}`,
          studentMatricule: a.studentMatricule,
          specialty: a.specialty,
          level: a.level,
          similarityScore: a.similarityScore || 0,
          originalityScore: a.originalityScore || 0,
          riskLevel: a.riskLevel?.toLowerCase() || 'none',
          analyzedAt: a.analyzedAt,
          rapportName: a.rapportName,
          juryAssigned: a.juryAssigned || [],
          status: a.status || 'pending',
        }))
        setAnalyses(mapped)
      }, 3000)
    } catch (error: any) {
      console.error("Erreur lors de l'analyse automatique:", error)
      setAnalyzeError(error.response?.data?.message || "Erreur lors de l'analyse")
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Filtering
  const filteredAnalyses = analyses.filter((analysis) => {
    const matchesSearch =
      analysis.studentName.toLowerCase().includes(search.toLowerCase()) ||
      analysis.studentMatricule.includes(search) ||
      analysis.specialty.toLowerCase().includes(search.toLowerCase())
    const matchesRisk = filterRisk === "all" || analysis.riskLevel === filterRisk
    return matchesSearch && matchesRisk
  })

  // Handle pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // Pagination slice
  const paginatedAnalyses = filteredAnalyses.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  // Helper functions for risk
  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case "low":
        return "Faible"
      case "medium":
        return "Moyen"
      case "high":
        return "Élevé"
      case "none":
        return "Non analysé"
      default:
        return "Inconnu"
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "success"
      case "medium":
        return "warning"
      case "high":
        return "error"
      case "none":
        return "info"
      default:
        return "default"
    }
  }

  // Statistics
  const lowRiskCount = analyses.filter((a) => a.riskLevel === "low").length
  const mediumRiskCount = analyses.filter((a) => a.riskLevel === "medium").length
  const highRiskCount = analyses.filter((a) => a.riskLevel === "high").length
  const totalAnalyses = analyses.length

  // Only count completed analyses for average originality
  const completedAnalyses = analyses.filter((a) => a.status === 'completed' && a.analyzedAt)
  const averageOriginality =
    completedAnalyses.length > 0
      ? Math.round(
        completedAnalyses.reduce((sum, a) => sum + a.originalityScore, 0) / completedAnalyses.length
      )
      : 0

  // Get the latest analysis date from completed analyses
  const latestAnalysisDate = (() => {
    if (completedAnalyses.length === 0) return "N/A"

    // Sort by analyzedAt descending and get the first one
    const sorted = [...completedAnalyses].sort((a, b) => {
      if (!a.analyzedAt) return 1
      if (!b.analyzedAt) return -1
      return new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime()
    })

    return sorted[0]?.analyzedAt
      ? new Date(sorted[0].analyzedAt).toLocaleDateString("fr-FR")
      : "N/A"
  })()

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, pb: 2, borderBottom: 1, borderColor: "divider" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Dashboard Plagiat - Vue Jury
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Résultats d'analyse pour tous les rapports de soutenance
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={isAnalyzing ? <CircularProgress size={20} color="inherit" /> : <PlayCircle style={{ width: 20, height: 20 }} />}
            onClick={handleAutoAnalyze}
            disabled={isAnalyzing || analyses.filter(a => a.status === 'pending').length === 0}
            sx={{ minWidth: 200 }}
          >
            {isAnalyzing ? "Analyse en cours..." : "Analyser tout"}
          </Button>
        </Box>
      </Box>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setShowSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Analyse lancée avec succès! Les résultats seront mis à jour dans quelques instants.
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!analyzeError}
        autoHideDuration={6000}
        onClose={() => setAnalyzeError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setAnalyzeError(null)} severity="error" sx={{ width: '100%' }}>
          {analyzeError}
        </Alert>
      </Snackbar>

      {/* Search & Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                fullWidth
                placeholder="Rechercher étudiant, matricule ou spécialité..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search style={{ width: 20, height: 20 }} />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Filtrer par risque</InputLabel>
                <Select
                  value={filterRisk}
                  label="Filtrer par risque"
                  onChange={(e) => setFilterRisk(e.target.value)}
                >
                  <MenuItem value="all">Tous les risques</MenuItem>
                  <MenuItem value="low">Faible</MenuItem>
                  <MenuItem value="medium">Moyen</MenuItem>
                  <MenuItem value="high">Élevé</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tableau détaillé */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title={
            <Typography variant="h6" fontWeight="bold">
              Tableau détaillé
            </Typography>
          }
        />
        <CardContent>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Étudiant</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Matricule</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Spécialité</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Niveau</TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold" }}>
                    Score plagiat
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold" }}>
                    Originalité
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold" }}>
                    Risque
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold" }}>
                    Jury assigné
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold" }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedAnalyses.map((analysis) => (
                  <TableRow key={analysis.rapportId} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {analysis.studentName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {analysis.rapportName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={analysis.studentMatricule}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{analysis.specialty}</TableCell>
                    <TableCell>{analysis.level}</TableCell>
                    <TableCell align="center">
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{
                          color:
                            analysis.similarityScore <= 20
                              ? theme.palette.success.main
                              : analysis.similarityScore <= 40
                                ? theme.palette.warning.main
                                : theme.palette.error.main,
                        }}
                      >
                        {analysis.similarityScore}%
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        color="primary"
                      >
                        {analysis.originalityScore}%
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={getRiskLabel(analysis.riskLevel)}
                        color={getRiskColor(analysis.riskLevel) as any}
                        variant="outlined"
                        size="small"
                        icon={
                          analysis.riskLevel === "low" ? (
                            <CheckCircle2 style={{ width: 14, height: 14 }} />
                          ) : (
                            <AlertTriangle style={{ width: 14, height: 14 }} />
                          )
                        }
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={
                          analysis.juryAssigned.length > 0
                            ? analysis.juryAssigned.join(", ")
                            : "Non attribué"
                        }
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => analysis.id && navigate(`/plagiat/analysis/${analysis.id}`)}
                        disabled={!analysis.id || analysis.status === 'pending'}
                        title={!analysis.id ? "Rapport non analysé" : "Voir les détails"}
                      >
                        <Eye style={{ width: 18, height: 18 }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <TablePagination
              component="div"
              count={filteredAnalyses.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
              labelRowsPerPage="Lignes par page:"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Distribution des risques et Informations */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader
              title={
                <Typography variant="h6" fontWeight="bold">
                  Distribution des risques
                </Typography>
              }
            />
            <CardContent>
              <Stack spacing={2}>
                {/* Faible risque */}
                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="body2">Faible</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {lowRiskCount} (
                      {Math.round((lowRiskCount / totalAnalyses) * 100)}%)
                    </Typography>
                  </Box>
                  <Box sx={{ height: 8, bgcolor: "grey.200", borderRadius: 1 }}>
                    <Box
                      sx={{
                        height: "100%",
                        width: `${(lowRiskCount / totalAnalyses) * 100}%`,
                        bgcolor: theme.palette.success.main,
                        borderRadius: 1,
                      }}
                    />
                  </Box>
                </Box>

                {/* Moyen risque */}
                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="body2">Moyen</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {mediumRiskCount} (
                      {Math.round((mediumRiskCount / totalAnalyses) * 100)}%)
                    </Typography>
                  </Box>
                  <Box sx={{ height: 8, bgcolor: "grey.200", borderRadius: 1 }}>
                    <Box
                      sx={{
                        height: "100%",
                        width: `${(mediumRiskCount / totalAnalyses) * 100}%`,
                        bgcolor: theme.palette.warning.main,
                        borderRadius: 1,
                      }}
                    />
                  </Box>
                </Box>

                {/* Élevé risque */}
                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="body2">Élevé</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {highRiskCount} (
                      {Math.round((highRiskCount / totalAnalyses) * 100)}%)
                    </Typography>
                  </Box>
                  <Box sx={{ height: 8, bgcolor: "grey.200", borderRadius: 1 }}>
                    <Box
                      sx={{
                        height: "100%",
                        width: `${(highRiskCount / totalAnalyses) * 100}%`,
                        bgcolor: theme.palette.error.main,
                        borderRadius: 1,
                      }}
                    />
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader
              title={
                <Typography variant="h6" fontWeight="bold">
                  Informations du module
                </Typography>
              }
            />
            <CardContent>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total rapports
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {totalAnalyses} rapports
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Rapports analysés
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {completedAnalyses.length} / {totalAnalyses}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Originalité moyenne
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {averageOriginality}%
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Dernière analyse
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {latestAnalysisDate}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}