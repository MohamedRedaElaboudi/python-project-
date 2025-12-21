import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import {
  Box,
  Chip,
  Grid,
  Fade,
  Paper,
  alpha,
  Button,
  Avatar,
  Tooltip,
  useTheme,
  TextField,
  Typography,
  IconButton,
  CardContent,
  InputAdornment,
  LinearProgress,
} from "@mui/material"
import {
  Zap,
  Shield,
  Search,
  FileText,
  Sparkles,
  BarChart,
  RefreshCw,
  FileCheck,
  TrendingUp,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  ChevronRight,
  AlertTriangle,
} from "lucide-react"

export function Plagiat() {
  const navigate = useNavigate()
  const theme = useTheme()

  const [searchQuery, setSearchQuery] = useState("")
  const [stats, setStats] = useState<any[]>([])
  const [recentAnalyses, setRecentAnalyses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  useEffect(() => {
    setLoading(true)
    axios
      .get("http://127.0.0.1:5000/api/plagiat/overview")
      .then((res) => {
        const data = res.data

        console.log("Données reçues de l'API:", data)

        setStats([
          {
            label: "Rapports analysés",
            value: data.stats.rapports_analyses,
            change: "+5",
            trend: "up",
            icon: FileText,
            color: theme.palette.primary.main,
            bgColor: alpha(theme.palette.primary.main, 0.08),
          },
          {
            label: "Originalité moyenne",
            value: `${data.stats.originalite_moyenne}%`,
            change: "+2%",
            trend: "up",
            icon: CheckCircle2,
            color: theme.palette.success.main,
            bgColor: alpha(theme.palette.success.main, 0.08),
          },
          {
            label: "Risques détectés",
            value: data.stats.risques_detectes,
            change: "-3",
            trend: "down",
            icon: AlertTriangle,
            color: theme.palette.warning.main,
            bgColor: alpha(theme.palette.warning.main, 0.08),
          },
          {
            label: "Analyses aujourd'hui",
            value: data.stats.analyses_aujourdhui,
            change: "+1",
            trend: "up",
            icon: Zap,
            color: theme.palette.info.main,
            bgColor: alpha(theme.palette.info.main, 0.08),
          },
        ])

        setRecentAnalyses(data.recent_analyses || [])
      })
      .catch((err) => console.error("Erreur API Plagiat:", err))
      .finally(() => setLoading(false))
  }, [theme])

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "faible":
      case "low":
        return "success"
      case "moyen":
      case "medium":
        return "warning"
      case "élevé":
      case "high":
        return "error"
      default:
        return "default"
    }
  }

  const getScoreColor = (score: number) => {
    if (score <= 15) return theme.palette.success.main
    if (score <= 40) return theme.palette.warning.main
    return theme.palette.error.main
  }

  const getRiskIcon = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "faible":
      case "low":
        return <CheckCircle2 size={16} />
      case "moyen":
      case "medium":
        return <AlertTriangle size={16} />
      case "élevé":
      case "high":
        return <AlertTriangle size={16} />
      default:
        return <CheckCircle2 size={16} />
    }
  }

  const StatCard = ({ stat, index }: { stat: any; index: number }) => {
    const Icon = stat.icon
    return (
      <Fade in={!loading} timeout={300 * (index + 1)}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            height: '100%',
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            background: `linear-gradient(135deg, ${stat.bgColor} 0%, ${alpha(stat.bgColor, 0.4)} 100%)`,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: theme.shadows[8],
              borderColor: stat.color,
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
                {stat.label}
              </Typography>
              <Typography variant="h3" fontWeight="bold" sx={{ color: stat.color }}>
                {stat.value}
              </Typography>
            </Box>
            <Avatar
              sx={{
                bgcolor: alpha(stat.color, 0.1),
                color: stat.color,
                width: 48,
                height: 48,
              }}
            >
              <Icon size={24} />
            </Avatar>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {stat.trend === "up" ? (
              <TrendingUp size={16} color={theme.palette.success.main} />
            ) : (
              <TrendingDown size={16} color={theme.palette.error.main} />
            )}
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: stat.trend === "up" ? theme.palette.success.main : theme.palette.error.main,
              }}
            >
              {stat.change}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ce mois
            </Typography>
          </Box>
        </Paper>
      </Fade>
    )
  }

  const AnalysisCard = ({ analysis }: { analysis: any }) => {
    const scoreColor = getScoreColor(analysis.similarity_score)
    const riskColor = getRiskColor(analysis.risk)

    return (
      <Fade in>
        <Paper
          elevation={hoveredCard === analysis.id ? 8 : 2}
          onMouseEnter={() => setHoveredCard(analysis.id)}
          onMouseLeave={() => setHoveredCard(null)}
          onClick={() => navigate(`/plagiat/analysis/${analysis.id}`)}
          sx={{
            p: 3,
            height: '100%',
            borderRadius: 3,
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            border: `2px solid ${hoveredCard === analysis.id ? scoreColor : 'transparent'}`,
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
              transform: 'translateY(-8px) scale(1.02)',
              boxShadow: `0 20px 40px ${alpha(scoreColor, 0.15)}`,
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: `linear-gradient(90deg, ${scoreColor}, ${alpha(scoreColor, 0.5)})`,
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
            },
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {`${analysis.prenom} ${analysis.name}`}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {analysis.date} • {analysis.time}
              </Typography>
            </Box>
            <Chip
              icon={getRiskIcon(analysis.risk)}
              label={analysis.risk}
              color={riskColor as any}
              size="small"
              sx={{
                fontWeight: 600,
                borderRadius: 2,
                px: 1,
              }}
            />
          </Box>

          <Box sx={{ mt: 3, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Score de similarité
              </Typography>
              <Typography variant="h5" fontWeight="bold" sx={{ color: scoreColor }}>
                {analysis.similarity_score}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={analysis.similarity_score}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: alpha(scoreColor, 0.1),
                '& .MuiLinearProgress-bar': {
                  bgcolor: scoreColor,
                  borderRadius: 4,
                },
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 3 }}>
            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <FileCheck size={12} />
              {analysis.originality_score || (100 - analysis.similarity_score)}% originalité
            </Typography>
            <Box sx={{ flex: 1 }} />
            <ChevronRight
              size={20}
              style={{
                color: scoreColor,
                opacity: hoveredCard === analysis.id ? 1 : 0.5,
                transform: hoveredCard === analysis.id ? 'translateX(4px)' : 'none',
                transition: 'all 0.2s',
              }}
            />
          </Box>
        </Paper>
      </Fade>
    )
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        p: { xs: 2, sm: 3, lg: 4 },
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(
          theme.palette.background.default,
          1
        )} 100%)`,
      }}
    >
      <Box sx={{ maxWidth: 1400, mx: 'auto', width: '100%' }}>
        {/* Header */}
        <Fade in={!loading}>
          <Box sx={{ mb: 5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
              <Avatar
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  width: 64,
                  height: 64,
                  border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                }}
              >
                <Shield size={32} />
              </Avatar>
              <Box>
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  Détection de Plagiat
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
                  Analyse automatisée des rapports pour les jurys
                </Typography>
              </Box>
            </Box>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${alpha(
                  theme.palette.primary.main,
                  0.02
                )} 100%)`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Sparkles size={20} color={theme.palette.primary.main} />
                <Typography variant="body1" sx={{ flex: 1 }}>
                  <strong>Système automatique :</strong> Les rapports sont analysés en temps réel et annotés
                  automatiquement pour faciliter la décision du jury.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<BarChart size={20} />}
                  onClick={() => navigate("/plagiat/dashboard")}
                  sx={{ borderRadius: 2, fontWeight: 600 }}
                >
                  Tableau de bord complet
                </Button>
              </Box>
            </Paper>
          </Box>
        </Fade>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          {stats.map((stat, index) => (
            <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={index}>
              <StatCard stat={stat} index={index} />
            </Grid>
          ))}
        </Grid>

        {/* Dernières analyses */}
        <Fade in={!loading}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              overflow: 'hidden',
              mb: 4,
            }}
          >
            <Box
              sx={{
                p: 3,
                borderBottom: `1px solid ${theme.palette.divider}`,
                background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(
                  theme.palette.background.paper,
                  1
                )} 100%)`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Dernières analyses
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {recentAnalyses.length} analyses récentes
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <TextField
                    placeholder="Rechercher un étudiant..."
                    size="small"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search size={20} color={theme.palette.text.secondary} />
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: 2,
                        minWidth: 250,
                      },
                    }}
                    variant="outlined"
                  />
                  <Tooltip title="Actualiser les analyses">
                    <IconButton
                      onClick={() => window.location.reload()}
                      sx={{
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 2,
                      }}
                    >
                      <RefreshCw size={20} />
                    </IconButton>
                  </Tooltip>
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/plagiat/dashboard")}
                    endIcon={<ArrowRight size={16} />}
                    sx={{ borderRadius: 2, fontWeight: 600 }}
                  >
                    Voir toutes les analyses
                  </Button>
                </Box>
              </Box>
            </Box>

            <CardContent sx={{ p: 3 }}>
              {recentAnalyses.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <FileText size={48} color={theme.palette.text.disabled} />
                  <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                    Aucune analyse disponible
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Lancez votre première analyse pour commencer
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {recentAnalyses
                    .filter((a) =>
                      `${a.prenom} ${a.name}`
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
                    )
                    .slice(0, 4)
                    .map((analysis) => (
                      <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={analysis.id}>
                        <AnalysisCard analysis={analysis} />
                      </Grid>
                    ))}
                </Grid>
              )}
            </CardContent>
          </Paper>
        </Fade>

        {/* Quick Actions */}
        <Fade in={!loading}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.04)} 0%, ${alpha(
                theme.palette.background.paper,
                1
              )} 100%)`,
            }}
          />
        </Fade>
      </Box>
    </Box>
  )
}