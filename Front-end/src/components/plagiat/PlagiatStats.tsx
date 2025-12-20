import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';

import { Assessment, Timeline } from '@mui/icons-material';

interface PlagiatStatsProps {
    totalMatches: number;
    avgSimilarity: number;
    highestSimilarity: number;
}

export const PlagiatStats: React.FC<PlagiatStatsProps> = ({
    totalMatches,
    avgSimilarity,
    highestSimilarity
}) => {

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>
                    Statistiques de l'analyse
                </Typography>

                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.neutral', borderRadius: 2 }}>
                            <Typography variant="h3" color="primary.main">
                                {totalMatches}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Correspondances trouvées
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 8 }}>
                        <Stack spacing={3}>
                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2">{typeof avgSimilarity === 'number' && !isNaN(avgSimilarity) ? avgSimilarity.toFixed(1) : '0.0'}%</Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={typeof avgSimilarity === 'number' && !isNaN(avgSimilarity) ? avgSimilarity : 0}
                                    color={avgSimilarity > 50 ? "warning" : "success"}
                                    sx={{ height: 8, borderRadius: 4 }}
                                />
                            </Box>

                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Pic de Similarité</Typography>
                                    <Typography variant="body2" color="error.main">{typeof highestSimilarity === 'number' && !isNaN(highestSimilarity) ? highestSimilarity.toFixed(1) : '0.0'}%</Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={typeof highestSimilarity === 'number' && !isNaN(highestSimilarity) ? highestSimilarity : 0}
                                    color="error"
                                    sx={{ height: 8, borderRadius: 4 }}
                                />
                            </Box>
                        </Stack>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

