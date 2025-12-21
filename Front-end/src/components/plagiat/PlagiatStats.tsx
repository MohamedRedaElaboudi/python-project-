import React from 'react';
import {
  Box,
  Card,
  Grid,
  Tooltip,
  Typography,
  CardContent,
  LinearProgress,
} from '@mui/material';
import { Timeline, PieChart, BarChart, Assessment } from '@mui/icons-material';

interface MatchesDistribution {
  [type: string]: number;
}

interface PlagiatAnalysis {
  totalWords?: number;
  totalCharacters?: number;
  totalParagraphs?: number;
  totalSentences?: number;
  uniqueWords?: number;
  similarity_score?: number;
  matches?: any[];
  matchesDistribution?: MatchesDistribution;
}

interface PlagiatStatsProps {
  analysis: PlagiatAnalysis;
}

export const PlagiatStats: React.FC<PlagiatStatsProps> = ({ analysis }) => {
  const {
    totalWords = 0,
    totalCharacters = 0,
    totalParagraphs = 0,
    totalSentences = 0,
    uniqueWords = 0,
    similarity_score = 0,
    matches = [],
    matchesDistribution = {},
  } = analysis;

  const averageSentenceLength = totalSentences ? totalWords / totalSentences : 0;

  const readabilityScore = Math.max(0, Math.min(100, 100 - similarity_score));
  const uniquePercentage = totalWords ? (uniqueWords / totalWords) * 100 : 0;

  const getProgressColor = (value: number) => {
    if (value > 70) return 'success.main';
    if (value > 40) return 'warning.main';
    return 'error.main';
  };

  return (
    <Card>
      <CardContent>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <Assessment /> Statistiques du document
        </Typography>

        <Grid container spacing={3}>
          {/* Métriques de base */}
          {[
            { label: 'Mots', value: totalWords, color: 'primary' },
            { label: 'Caractères', value: totalCharacters, color: 'secondary' },
            { label: 'Paragraphes', value: totalParagraphs, color: 'success' },
            { label: 'Phrases', value: totalSentences, color: 'warning' },
          ].map(({ label, value, color }) => (
            <Grid size={{ xs: 6, sm: 3 }} key={label}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color={color} fontWeight="bold">
                  {value.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {label}
                </Typography>
              </Box>
            </Grid>
          ))}

          {/* Score de lisibilité */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <Timeline fontSize="small" /> Score de lisibilité
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={readabilityScore}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getProgressColor(readabilityScore),
                      },
                    }}
                  />
                </Box>
                <Typography variant="body1" fontWeight="bold">
                  {Math.round(readabilityScore)}%
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Unicité du vocabulaire */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <PieChart fontSize="small" /> Unicité du vocabulaire
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={uniquePercentage}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
                <Typography variant="body1" fontWeight="bold">
                  {uniquePercentage.toFixed(1)}%
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Distribution des correspondances */}
          {Object.keys(matchesDistribution).length > 0 && (
            <Grid size={{ xs: 12 }}>
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <BarChart fontSize="small" /> Distribution par type de source
              </Typography>
              <Grid container spacing={1}>
                {Object.entries(matchesDistribution).map(([type, count]) => (
                  <Grid size={{ xs: 12, sm: 6, md: 3 }} key={type}>
                    <Tooltip title={`${count} correspondance(s) de type ${type}`}>
                      <Box sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {type}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {count} ({matches.length ? ((count / matches.length) * 100).toFixed(1) : 0}%)
                        </Typography>
                      </Box>
                    </Tooltip>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};
