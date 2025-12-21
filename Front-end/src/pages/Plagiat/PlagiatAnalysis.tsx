import React, { useState, useEffect } from "react";
import { useTheme } from "@mui/material";
import {
  Box,
  Chip,
  Card,
  Grid,
  Paper,
  Alert,
  Stack,
  Table,
  Badge,
  Button,
  Avatar,
  Divider,
  Tooltip,
  TableRow,
  Container,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  IconButton,
  CardContent,
  LinearProgress,
  TableContainer,
  TableSortLabel,
  CircularProgress,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import {
  Web,
  Refresh,
  Warning,
  Article,
  BarChart,
  ArrowBack,
  OpenInNew,
  CheckCircle,
  TextSnippet,
  ContentCopy,
  CompareArrows,
  Link as LinkIcon,
} from "@mui/icons-material";
import axios from "axios";
import { PlagiatNav } from 'src/components/PlagiatNav';

interface Source {
  chunk_index: number;
  matched_text: string;
  original_text: string;
  page: number;
  score: number;
  similarity: number;
  source: string;
  source_url: string;
  text: string;
}

interface AnalysisData {
  student: string;
  rapport: string;
  similarity: number;
  originality: number;
  risk: string;
  sources: Source[];
  ai_score: number;
  avg_similarity: number;
  chunks_analyzed: number;
  chunks_with_matches: number;
  total_matches: number;
  total_words: number;
  total_characters: number;
  total_paragraphs: number;
  total_sentences: number;
  unique_words: number;
  readability_score: number;
  storage_path: string;
}

interface ApiResponse {
  analysis: AnalysisData;
  analysis_id: number;
  analyzed_at: string;
  created_at: string | null;
  matches_saved: number;
  rapport_id: number;
  status: string;
  student_id: number;
}

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  subtitle?: string;
}> = ({ title, value, icon, color = "primary", subtitle }) => (
  <Card sx={{ height: '100%', borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
    <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
      <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.main`, width: 40, height: 40 }}>
        {icon}
      </Avatar>
      <Box>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          {title}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </CardContent>
  </Card>
);


const SimilarityGauge: React.FC<{ value: number; label: string }> = ({ value, label }) => {
  const getColor = (val: number) => {
    if (val <= 15) return '#4caf50';
    if (val <= 40) return '#ff9800';
    return '#f44336';
  };

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Box sx={{ position: 'relative', display: 'inline-block' }}>
        <CircularProgress
          variant="determinate"
          value={100}
          size={120}
          thickness={4}
          sx={{ color: 'grey.200' }}
        />
        <CircularProgress
          variant="determinate"
          value={Math.min(value, 100)}
          size={120}
          thickness={4}
          sx={{
            position: 'absolute',
            left: 0,
            color: getColor(value),
            '& .MuiCircularProgress-circle': {
              transition: 'stroke-dashoffset 0.8s ease 0s',
            },
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Typography variant="h4" fontWeight="bold">
            {value.toFixed(1)}%
          </Typography>
        </Box>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
        {label}
      </Typography>
    </Box>
  );
};

const RiskBadge: React.FC<{ risk: string }> = ({ risk }) => {
  const getConfig = (r: string) => {
    switch (r.toLowerCase()) {
      case 'high':
        return { color: 'error', label: 'Élevé', icon: <Warning /> };
      case 'medium':
        return { color: 'warning', label: 'Moyen', icon: <Warning /> };
      case 'low':
        return { color: 'success', label: 'Faible', icon: <CheckCircle /> };
      default:
        return { color: 'info', label: 'Nul', icon: <CheckCircle /> };
    }
  };

  const config = getConfig(risk);

  return (
    <Chip
      icon={config.icon}
      label={config.label}
      color={config.color as any}
      sx={{
        fontWeight: 700,
        fontSize: '0.875rem',
        px: 1.5,
        py: 1,
        borderRadius: 2,
      }}
    />
  );
};


const MatchDetailPanel: React.FC<{ source: Source; handleCopy: (text: string) => void }> = ({
  source,
  handleCopy,
}) => {
  const theme = useTheme();

  return (
    <Paper elevation={4} sx={{ p: 3, height: 'calc(100vh - 100px)', overflowY: 'auto', borderRadius: 2 }}>
      <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
        Détails de la Correspondance (Chunk {source.chunk_index + 1})
      </Typography>

      <Stack spacing={2}>
        {/* URL Source */}
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight="600">
            Source ({source.source})
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LinkIcon fontSize="small" color="primary" />
            <Tooltip title={source.source_url}>
              <Typography
                variant="body1"
                sx={{
                  flexGrow: 1,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {source.source_url || 'URL non disponible'}
              </Typography>
            </Tooltip>
            {source.source_url && (
              <IconButton size="small" onClick={() => window.open(source.source_url, '_blank')}>
                <OpenInNew fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>
        <Divider />

        {/* Similarité et Score */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <StatCard
              title="Similarité"
              value={`${source.similarity.toFixed(1)}%`}
              icon={<CompareArrows />}
              color={source.similarity > 60 ? 'error' : source.similarity > 30 ? 'warning' : 'success'}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <StatCard
              title="Page/Chunk"
              value={`${source.page} / ${source.chunk_index + 1}`}
              icon={<Article />}
              color="info"
            />
          </Grid>
        </Grid>
        <Divider />

        {/* Texte du Rapport */}
        <Paper variant="outlined" sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50' }}>
          <Typography variant="body2" color="text.secondary" fontWeight="600" sx={{ mb: 1 }}>
            Texte soumis (Rapport)
            <Tooltip title="Copier le texte soumis">
              <IconButton size="small" onClick={() => handleCopy(source.text)} sx={{ ml: 1 }}>
                <ContentCopy fontSize="inherit" />
              </IconButton>
            </Tooltip>
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontStyle: 'italic',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              color: theme.palette.text.primary
            }}
          >
            {source.text}
          </Typography>
        </Paper>

        {/* Texte Trouvé (Source) */}
        <Paper variant="outlined" sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50' }}>
          <Typography variant="body2" color="text.secondary" fontWeight="600" sx={{ mb: 1 }}>
            Texte Correspondant (Source web)
            <Tooltip title="Copier le texte source">
              <IconButton size="small" onClick={() => handleCopy(source.matched_text)} sx={{ ml: 1 }}>
                <ContentCopy fontSize="inherit" />
              </IconButton>
            </Tooltip>
          </Typography>
          <Typography
            variant="body1"
            sx={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              color: theme.palette.text.primary
            }}
          >
            {source.matched_text || 'Non disponible.'}
          </Typography>
        </Paper>
      </Stack>
    </Paper>
  );
};


export const PlagiatAnalysis: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();

  // État et logique de chargement... (inchangé)
  const [loading, setLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [rapportId, setRapportId] = useState<number | null>(null);
  const [error, setError] = useState<string>("");
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [sortBy, setSortBy] = useState<'similarity' | 'chunk'>('similarity');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isReanalyzing, setIsReanalyzing] = useState(false);


  useEffect(() => {
    if (id) fetchAnalysis(id);
  }, [id]);

  const fetchAnalysis = async (analysisId: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get<ApiResponse>(
        `http://localhost:5000/api/plagiat/analysis/${analysisId}`
      );

      const raw = res.data;

      // Save rapport_id for re-analysis
      setRapportId(raw.rapport_id);

      // MAPPING: Backend -> Frontend
      const mappedData: AnalysisData = {
        student: `${raw.studentInfo?.prenom || ""} ${raw.studentInfo?.name || ""}`.trim() || "Inconnu",
        rapport: raw.rapportInfo?.filename || "Rapport",
        similarity: raw.similarityScore,
        originality: raw.originalityScore,
        risk: raw.riskLevel,
        sources: (raw.matches || []).map((m: any) => ({
          chunk_index: m.chunkIndex,
          matched_text: m.matchedText,
          original_text: m.originalText,
          page: m.page,
          score: m.score,
          similarity: m.similarity,
          source: m.source,
          source_url: m.sourceUrl,
          text: m.text
        })),
        ai_score: raw.aiScore,
        avg_similarity: 0, // Not provided directly, default to 0
        chunks_analyzed: raw.chunksAnalyzed,
        chunks_with_matches: raw.chunksWithMatches,
        total_matches: raw.totalMatches,
        total_words: raw.wordCount || 0,
        total_characters: raw.characterCount || 0,
        total_paragraphs: raw.paragraphCount || 0,
        total_sentences: 0, // Not provided
        unique_words: raw.uniqueWords || 0,
        readability_score: raw.readabilityScore || 0,
        storage_path: raw.rapportInfo?.storagePath || ""
      };

      setAnalysisData(mappedData);
      console.log("Données mappées:", mappedData);

      // Réinitialiser le détail si les données changent
      setSelectedSource(null);
    } catch (err: any) {
      console.error("Erreur détaillée:", err);
      setError(
        err.response?.data?.error ||
        err.message ||
        "Erreur lors du chargement de l'analyse."
      );
      setAnalysisData(null);
    } finally {
      setLoading(false);
    }
  };


  const handleGenerateReport = async () => {
    if (!analysisData || !id) {
      setError("Aucune donnée d'analyse disponible");
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:5000/api/plagiat/generate-report/${id}`,
        { storage_path: analysisData.storage_path },
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `rapport-plagiat-${analysisData.rapport.replace('.pdf', '')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError("Erreur lors de la génération du rapport");
    }
  };

  const handleReanalyze = async () => {
    if (!rapportId || !id) {
      setError("Impossible de relancer l'analyse");
      return;
    }

    try {
      setIsReanalyzing(true);
      setError("");

      // Use rapport_id to re-analyze
      await axios.post(
        `http://localhost:5000/api/plagiat/analyze/${rapportId}`
      );

      // Wait a bit for the analysis to complete, then refresh
      setTimeout(() => {
        fetchAnalysis(id);
        setIsReanalyzing(false);
      }, 2000);
    } catch (err: any) {
      console.error("Erreur lors de la réanalyse:", err);
      setError(err.response?.data?.error || "Erreur lors de la réanalyse");
      setIsReanalyzing(false);
    }
  };

  const handleSort = (property: 'similarity' | 'chunk') => {
    const isAsc = sortBy === property && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortBy(property);
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
  };


  const getSortedSources = () => {
    if (!analysisData?.sources) return [];

    return [...analysisData.sources].sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'similarity') {
        comparison = a.similarity - b.similarity;
      } else if (sortBy === 'chunk') {
        comparison = a.chunk_index - b.chunk_index;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  const TabPanel = (props: { children?: React.ReactNode; index: number; value: number }) => {
    const { children, value, index, ...other } = props;
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ py: 3 }}>
            {children}
          </Box>
        )}
      </div>
    );
  };

  const MatchTable = () => {
    const sortedSources = getSortedSources();

    return (
      <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '10%' }}>
                <TableSortLabel
                  active={sortBy === 'chunk'}
                  direction={sortBy === 'chunk' ? sortDirection : 'asc'}
                  onClick={() => handleSort('chunk')}
                >
                  Chunk/Page
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ width: '40%' }}>Texte Soumis (Extrait)</TableCell>
              <TableCell sx={{ width: '15%' }}>Source</TableCell>
              <TableCell sx={{ width: '15%' }} align="right">
                <TableSortLabel
                  active={sortBy === 'similarity'}
                  direction={sortBy === 'similarity' ? sortDirection : 'desc'}
                  onClick={() => handleSort('similarity')}
                >
                  Similarité (%)
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ width: '10%' }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedSources.map((source, index) => (
              <TableRow
                key={index}
                onClick={() => setSelectedSource(source)}
                sx={{
                  cursor: 'pointer',
                  bgcolor: selectedSource?.chunk_index === source.chunk_index ? theme.palette.action.hover : 'inherit',
                  '&:hover': {
                    bgcolor: theme.palette.action.hover,
                  }
                }}
              >
                <TableCell>
                  <Stack>
                    <Typography variant="body2" fontWeight="600">Chunk {source.chunk_index + 1}</Typography>
                    <Typography variant="caption" color="text.secondary">Page {source.page}</Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Tooltip title={source.text}>
                    <Typography
                      variant="body2"
                      noWrap
                    >
                      {source.text}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={<Web fontSize="small" />}
                    label={source.source.substring(0, 15)}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right">
                  <Badge
                    badgeContent={`${source.similarity.toFixed(1)}%`}
                    color={source.similarity > 60 ? 'error' : source.similarity > 30 ? 'warning' : 'success'}
                    sx={{ '& .MuiBadge-badge': { fontSize: 13, height: 20, minWidth: 40 } }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Ouvrir la source">
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); window.open(source.source_url, '_blank') }}>
                      <OpenInNew fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };


  if (loading)
    return (
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <CircularProgress size={80} thickness={4} />
        <Box>
          <Typography variant="h5" fontWeight="600" gutterBottom>
            Analyse en cours...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Veuillez patienter pendant le traitement du document
          </Typography>
        </Box>
      </Container>
    );

  if (error || !analysisData)
    return (
      <Container sx={{ py: 6 }}>
        <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <CardContent sx={{ p: 4 }}>
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              <Typography variant="body1" fontWeight="600">
                {error || "Analyse non trouvée"}
              </Typography>
            </Alert>
            <Button
              variant="contained"
              startIcon={<ArrowBack />}
              onClick={() => navigate("/plagiat/dashboard")}
              sx={{ borderRadius: 2 }}
            >
              Retour au Dashboard
            </Button>
          </CardContent>
        </Card>
      </Container>
    );

  const {
    student,
    rapport,
    similarity,
    originality,
    risk,
    sources,
    ai_score,
    avg_similarity,
    chunks_analyzed,
    chunks_with_matches,
    total_matches = sources.length,
    total_words,
    total_characters,
    total_paragraphs,
    total_sentences,
    unique_words,
    readability_score,
  } = analysisData;

  const hasMatches = sources.length > 0;
  const matchRate = chunks_analyzed > 0 ? (chunks_with_matches / chunks_analyzed * 100).toFixed(1) : 0;
  const mainGridSize = selectedSource ? 7 : 12;

  return (
    <>
      <PlagiatNav />
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header avec breadcrumb et actions */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate("/plagiat/dashboard")}
              sx={{ color: 'text.secondary' }}
            >
              Dashboard
            </Button>
            <Typography color="text.secondary">/</Typography>
            <Typography color="primary" fontWeight="600">
              Analyse #{id}
            </Typography>
          </Box>

          <Card sx={{ borderRadius: 2, mb: 3, overflow: 'hidden' }}>
            <CardContent sx={{ p: 3 }}>
              <Grid container alignItems="center" spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                  <Stack spacing={1.5}>
                    <Typography variant="h4" fontWeight="700">
                      {rapport}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                      <Chip
                        avatar={<Avatar sx={{ bgcolor: 'primary.light' }}>S</Avatar>}
                        label={`Étudiant: ${student}`}
                        variant="outlined"
                        sx={{ borderRadius: 2 }}
                      />
                      <Chip
                        icon={<BarChart />}
                        label={`${total_matches} correspondances`}
                        variant="outlined"
                        sx={{ borderRadius: 2 }}
                      />
                      <RiskBadge risk={risk} />
                    </Box>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Stack direction="row" spacing={1.5} justifyContent={{ md: 'flex-end' }}>

                    <Tooltip title={isReanalyzing ? "Analyse en cours..." : "Réanalyser ce rapport"}>
                      <span>
                        <IconButton
                          onClick={handleReanalyze}
                          disabled={isReanalyzing}
                          sx={{
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 2,
                          }}
                        >
                          {isReanalyzing ? <CircularProgress size={24} /> : <Refresh />}
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>

        {/* Section principale - Scores, Stats et Détai */}
        <Grid container spacing={3}>

          {/* COLONNE GAUCHE (Scores & Stats) - La taille change dynamiquement */}
          <Grid size={{ xs: 12, lg: mainGridSize }}>
            <Grid container spacing={3}>

              {/* Blocs de scores */}
              <Grid size={{ xs: 12, lg: 6 }}>
                <Card sx={{ borderRadius: 2, height: '100%' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="600" gutterBottom>
                      Scores principaux
                    </Typography>
                    <Grid container spacing={4} sx={{ mt: 1 }}>
                      <Grid size={{ xs: 6 }}>
                        <SimilarityGauge value={similarity} label="Similarité" />
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <SimilarityGauge value={originality} label="Originalité" />
                      </Grid>
                    </Grid>
                    <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Score moyen de similarité
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <LinearProgress
                          variant="determinate"
                          value={avg_similarity}
                          sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                          color={
                            avg_similarity <= 15 ? 'success' :
                              avg_similarity <= 40 ? 'warning' : 'error'
                          }
                        />
                        <Typography variant="body1" fontWeight="600">
                          {avg_similarity.toFixed(1)}%
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Blocs des stats d'analyse */}
              <Grid size={{ xs: 12, lg: 6 }}>
                <Card sx={{ borderRadius: 2, height: '100%' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="600" gutterBottom>
                      Statistiques d'analyse
                    </Typography>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid size={{ xs: 6 }}>
                        <StatCard
                          title="Chunks analysés"
                          value={chunks_analyzed}
                          icon={<TextSnippet />}
                          color="primary"
                        />
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <StatCard
                          title="Chunks avec matches"
                          value={chunks_with_matches}
                          icon={<CompareArrows />}
                          color="warning"
                          subtitle={`${matchRate}% de taux`}
                        />
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <StatCard
                          title="Score IA"
                          value={`${ai_score}%`}
                          icon={<Warning />}
                          color="error"
                          subtitle={ai_score > 50 ? "Risque élevé" : "Risque faible"}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Statistiques du document (bas) */}
              <Grid size={{ xs: 12 }}>
                <Card sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="600" gutterBottom>
                      Statistiques du document
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          <Typography variant="h4" fontWeight="700" color="primary">
                            {total_words.toLocaleString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Mots
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          <Typography variant="h4" fontWeight="700" color="secondary">
                            {total_characters.toLocaleString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Caractères
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          <Typography variant="h4" fontWeight="700" color="success.main">
                            {total_paragraphs}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Paragraphes
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          <Typography variant="h4" fontWeight="700" color="warning.main">
                            {unique_words.toLocaleString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Mots uniques
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

            </Grid>
          </Grid>

          {/* COLONNE DROITE (Détail du Match Sélectionné) */}
          {selectedSource && (
            <Grid size={{ xs: 12, lg: 5 }}>
              <MatchDetailPanel
                source={selectedSource}
                handleCopy={handleCopyText}
              />
            </Grid>
          )}
        </Grid>
      </Container>
    </>
  );
};