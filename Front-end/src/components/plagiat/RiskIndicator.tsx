import React from 'react';
import {
    Box,
    Typography,
    LinearProgress,
    Tooltip,
    Chip,
    Alert,
    AlertTitle,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';

interface RiskIndicatorProps {
    riskLevel: 'very-low' | 'low' | 'medium' | 'high' | 'very-high';
    score: number;
    confidence: number;
    warnings?: string[];
    recommendations?: string[];
}

const RiskLevelIndicator = styled(Box)<{ level: string }>(({ level, theme }) => {
    const colors = {
        'very-low': theme.palette.success.light,
        'low': theme.palette.success.main,
        'medium': theme.palette.warning.main,
        'high': theme.palette.error.main,
        'very-high': theme.palette.error.dark,
    };

    return {
        width: '100%',
        height: 12,
        borderRadius: 6,
        background: `linear-gradient(to right,
      ${theme.palette.success.light} 0%,
      ${theme.palette.success.main} 20%,
      ${theme.palette.warning.main} 40%,
      ${theme.palette.error.main} 60%,
      ${theme.palette.error.dark} 80%)`,
        position: 'relative',
        '&::after': {
            content: '""',
            position: 'absolute',
            left: `${level === 'very-low' ? 10 :
                level === 'low' ? 25 :
                    level === 'medium' ? 50 :
                        level === 'high' ? 75 : 90}%`,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 20,
            height: 20,
            borderRadius: '50%',
            backgroundColor: colors[level] || theme.palette.grey[500],
            border: `3px solid ${theme.palette.background.paper}`,
            boxShadow: theme.shadows[2],
        },
    };
});

const RiskBadge = styled(Chip)<{ level: string }>(({ level, theme }) => {
    const styles = {
        'very-low': {
            bgcolor: theme.palette.success.light,
            color: theme.palette.success.contrastText,
        },
        'low': {
            bgcolor: theme.palette.success.main,
            color: theme.palette.success.contrastText,
        },
        'medium': {
            bgcolor: theme.palette.warning.main,
            color: theme.palette.warning.contrastText,
        },
        'high': {
            bgcolor: theme.palette.error.main,
            color: theme.palette.error.contrastText,
        },
        'very-high': {
            bgcolor: theme.palette.error.dark,
            color: theme.palette.error.contrastText,
        },
    };

    return {
        fontWeight: 'bold',
        ...styles[level],
    };
});

export const RiskIndicator: React.FC<RiskIndicatorProps> = ({
    riskLevel,
    score,
    confidence,
    warnings = [],
    recommendations = [],
}) => {
    const getRiskConfig = () => {
        const configs = {
            'very-low': {
                label: 'Très faible',
                description: 'Risque de plagiat négligeable',
                icon: <CheckCircleIcon />,
                severity: 'success' as const,
            },
            'low': {
                label: 'Faible',
                description: 'Risque minimal, probablement des coïncidences',
                icon: <CheckCircleIcon />,
                severity: 'success' as const,
            },
            'medium': {
                label: 'Moyen',
                description: 'Présence de similitudes nécessitant une vérification',
                icon: <WarningIcon />,
                severity: 'warning' as const,
            },
            'high': {
                label: 'Élevé',
                description: 'Risque significatif de plagiat détecté',
                icon: <ErrorIcon />,
                severity: 'error' as const,
            },
            'very-high': {
                label: 'Très élevé',
                description: 'Plagiat très probable, action immédiate requise',
                icon: <ErrorIcon />,
                severity: 'error' as const,
            },
        };

        return configs[riskLevel] || configs.medium;
    };

    const config = getRiskConfig();

    return (
        <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Niveau de risque détecté
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {config.description}
                    </Typography>
                </Box>

                <RiskBadge
                    level={riskLevel}
                    label={config.label}
                    icon={config.icon}
                    size="medium"
                />
            </Box>

            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" color="success.main">
                        Très faible
                    </Typography>
                    <Typography variant="caption" color="error.main">
                        Très élevé
                    </Typography>
                </Box>

                <RiskLevelIndicator level={riskLevel} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                        0%
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                        Score: {typeof score === 'number' && !isNaN(score) ? score : 0}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        100%
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                    Confiance de la détection: {typeof confidence === 'number' && !isNaN(confidence) ? confidence : 0}%
                </Typography>
                <Tooltip title={`Confiance dans les résultats: ${typeof confidence === 'number' && !isNaN(confidence) ? confidence : 0}%`}>
                    <LinearProgress
                        variant="determinate"
                        value={typeof confidence === 'number' && !isNaN(confidence) ? confidence : 0}
                        sx={{
                            height: 8,
                            borderRadius: 4,
                            '& .MuiLinearProgress-bar': {
                                backgroundColor: (confidence || 0) > 80 ? 'success.main' :
                                    (confidence || 0) > 60 ? 'warning.main' : 'error.main',
                            },
                        }}
                    />
                </Tooltip>
            </Box>

            {warnings.length > 0 && (
                <Alert severity={config.severity} sx={{ mb: 2 }}>
                    <AlertTitle>Avertissements</AlertTitle>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                        {warnings.map((warning, index) => (
                            <li key={index}>
                                <Typography variant="body2">{warning}</Typography>
                            </li>
                        ))}
                    </ul>
                </Alert>
            )}

            {recommendations.length > 0 && (
                <Alert severity="info" icon={<InfoIcon />}>
                    <AlertTitle>Recommandations</AlertTitle>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                        {recommendations.map((rec, index) => (
                            <li key={index}>
                                <Typography variant="body2">{rec}</Typography>
                            </li>
                        ))}
                    </ul>
                </Alert>
            )}

            <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary">
                    <strong>Interprétation:</strong> Score ≥ 70% = risque élevé, 40-69% = risque moyen, ≤ 39% = risque faible
                </Typography>
            </Box>
        </Box>
    );
};
