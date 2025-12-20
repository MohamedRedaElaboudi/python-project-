import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';

import { PlagiatAnalysisResult } from './index';
import { PlagiatScoreCard } from './PlagiatScoreCard';
import { PlagiatStats } from './PlagiatStats';
import { RiskIndicator } from './RiskIndicator';
import { SimilarityViewer } from './SimilarityViewer';

interface Props {
    result: PlagiatAnalysisResult;
}

export function PlagiatResult({ result }: Props) {
    const [selectedMatch, setSelectedMatch] = useState<any>(null);

    if (!result) {
        return <Alert severity="info">Aucun résultat d'analyse disponible.</Alert>;
    }

    if (result.status === 'failed') {
        return <Alert severity="error">L'analyse a échoué.</Alert>;
    }

    // Calculs statistiques simples
    const totalMatches = result.sources?.length || 0;
    const avgSimilarity = totalMatches > 0
        ? result.sources.reduce((acc, m) => acc + m.similarity, 0) / totalMatches
        : 0;

    return (
        <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <RiskIndicator
                        score={result.similarity}
                        riskLevel={(result.risk as any) || 'medium'}
                        confidence={100}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 8 }}>
                    <PlagiatStats
                        totalMatches={totalMatches}
                        avgSimilarity={avgSimilarity}
                        highestSimilarity={result.sources?.length > 0 ? Math.max(...result.sources.map(m => m.similarity)) : 0}
                    />
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Détails des correspondances</Typography>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 4 }} sx={{ maxHeight: 400, overflowY: 'auto' }}>
                            {(result.sources || []).map((match, index) => (
                                <Box
                                    key={`${match.id}-${index}`}
                                    sx={{
                                        mb: 1,
                                        cursor: 'pointer',
                                        border: selectedMatch?.id === match.id ? '2px solid' : 'none',
                                        borderColor: 'primary.main',
                                        borderRadius: 1
                                    }}
                                    onClick={() => setSelectedMatch(match)}
                                >
                                    <PlagiatScoreCard
                                        score={match.similarity}
                                        totalMatches={1}
                                        sourcesCount={1}
                                        documentName={match.source_url || match.source || "Source Inconnue"}
                                        date={result.created_at || new Date().toISOString()}
                                        riskLevel={match.similarity > 70 ? 'high' : match.similarity > 40 ? 'medium' : 'low'}
                                    />
                                </Box>
                            ))}
                        </Grid>
                        <Grid size={{ xs: 12, md: 8 }}>
                            {selectedMatch ? (
                                <SimilarityViewer match={selectedMatch} />
                            ) : (
                                <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'background.neutral', borderRadius: 1 }}>
                                    <Typography color="text.secondary">Sélectionnez une correspondance pour voir les détails.</Typography>
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
}

export default PlagiatResult;
