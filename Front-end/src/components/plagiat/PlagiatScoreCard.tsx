import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';

interface PlagiatScoreCardProps {
  score: number;
  totalMatches: number;
  sourcesCount: number;
  documentName: string;
  date: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const ScoreCircle = styled(Box)<{ score: number }>(({ score, theme }) => {
  let color = theme.palette.success.main;
  if (score > 30 && score <= 60) color = theme.palette.warning.main;
  if (score > 60) color = theme.palette.error.main;

  return {
    width: 100,
    height: 100,
    borderRadius: '50%',
    background: `conic-gradient(${color} ${score * 3.6}deg, #e0e0e0 0deg)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    margin: '0 auto',
    '&::before': {
      content: '""',
      position: 'absolute',
      width: 80,
      height: 80,
      borderRadius: '50%',
      background: 'white',
    },
  };
});

const RiskChip = ({ level }: { level: string }) => {
  const config = {
    low: { label: 'Faible', color: 'success' as const, icon: <CheckCircleIcon /> },
    medium: { label: 'Moyen', color: 'warning' as const, icon: <WarningIcon /> },
    high: { label: 'Élevé', color: 'error' as const, icon: <WarningIcon /> },
    critical: { label: 'Critique', color: 'error' as const, icon: <ErrorIcon /> },
  }[level] || { label: 'Inconnu', color: 'default' as const, icon: null };

  return (
    <Chip
      label={config.label}
      color={config.color}
      icon={config.icon}
      size="small"
      sx={{ fontWeight: 'bold' }}
    />
  );
};

export const PlagiatScoreCard: React.FC<PlagiatScoreCardProps> = ({
  score,
  totalMatches,
  sourcesCount,
  documentName,
  date,
  riskLevel,
}) => {
  const getScoreColor = () => {
    if (score <= 20) return 'success.main';
    if (score <= 40) return 'warning.main';
    if (score <= 60) return 'error.main';
    return 'error.dark';
  };

  const getScoreMessage = () => {
    if (score <= 10) return 'Originalité excellente';
    if (score <= 20) return 'Très bon niveau d\'originalité';
    if (score <= 30) return 'Originalité satisfaisante';
    if (score <= 40) return 'Présence de similitudes modérées';
    if (score <= 50) return 'Risque de plagiat significatif';
    if (score <= 70) return 'Risque de plagiat élevé';
    return 'Risque de plagiat très élevé';
  };

  return (
    <StyledCard>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="h6" component="div" noWrap>
              {documentName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Analysé le {new Date(date).toLocaleDateString('fr-FR')}
            </Typography>
          </Box>
          <RiskChip level={riskLevel} />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box sx={{ position: 'relative', mr: 3 }}>
            <ScoreCircle score={score}>
              <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" color={getScoreColor()}>
                  {score}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Similarité
                </Typography>
              </Box>
            </ScoreCircle>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {getScoreMessage()}
            </Typography>

            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" display="block" color="text.secondary">
                Progression du risque
              </Typography>
              <LinearProgress
                variant="determinate"
                value={score}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  mt: 0.5,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: getScoreColor(),
                  },
                }}
              />
            </Box>
          </Box>
        </Box>

        <Box sx={{
          display: 'flex',
          justifyContent: 'space-around',
          mt: 3,
          pt: 2,
          borderTop: 1,
          borderColor: 'divider'
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" fontWeight="bold" color="primary">
              {totalMatches}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Correspondances
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" fontWeight="bold" color="secondary">
              {sourcesCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Sources
            </Typography>
          </Box>

          <Tooltip title="Plus le score est bas, mieux c'est">
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" fontWeight="bold" color={getScoreColor()}>
                {100 - score}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Originalité
              </Typography>
            </Box>
          </Tooltip>
        </Box>
      </CardContent>
    </StyledCard>
  );
};