
import Card from '@mui/material/Card';
import Grid from '@mui/material/Unstable_Grid2';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';

import YoutubeSearchedForIcon from '@mui/icons-material/YoutubeSearchedFor';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArticleIcon from '@mui/icons-material/Article';
import SmartToyIcon from '@mui/icons-material/SmartToy';

import { PlagiatAnalysisResult, PlagiatSource } from '../../api/plagiat-service';

type Props = {
    result: PlagiatAnalysisResult;
};

export function PlagiatResult({ result }: Props) {
    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'high': return 'error';
            case 'medium': return 'warning';
            case 'low': return 'info';
            default: return 'success';
        }
    };

    return (
        <Grid container spacing={3}>
            {/* 1. Global Score Card */}
            <Grid xs={12}>
                <Card sx={{ p: 3, textAlign: 'center', boxShadow: 3 }}>
                    <Typography variant="h6" gutterBottom>Score de Similitude Global</Typography>
                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                        <Typography variant="h2" color={getRiskColor(result.risk) + '.main'} fontWeight="bold">
                            {result.similarity}%
                        </Typography>
                    </Box>
                    <Typography variant="subtitle1" color="text.secondary">
                        Originalité: {result.originality}%
                    </Typography>
                    <Chip
                        label={`Risque: ${result.risk.toUpperCase()}`}
                        color={getRiskColor(result.risk) as any}
                        sx={{ mt: 1 }}
                    />
                </Card>
            </Grid>

            {/* 2. AI Score */}
            <Grid xs={12} md={6}>
                <Card sx={{ height: '100%', border: '1px solid #e0e0e0' }}>
                    <CardHeader
                        title="Détection IA"
                        avatar={<SmartToyIcon color="primary" />}
                        action={<Chip label={`${result.ai_score}%`} color={result.ai_score > 50 ? 'warning' : 'success'} />}
                    />
                    <CardContent>
                        <Typography variant="body2" color="text.secondary">
                            Probabilité que le texte soit généré par une IA.
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>

            {/* 3. Coverage Stats */}
            <Grid xs={12} md={6}>
                <Card sx={{ height: '100%', border: '1px solid #e0e0e0' }}>
                    <CardHeader
                        title="Couverture"
                        avatar={<ArticleIcon color="info" />}
                    />
                    <CardContent>
                        <Typography variant="body2">
                            <strong>{result.matches_saved}</strong> correspondances trouvées.
                        </Typography>
                        <Typography variant="body2">
                            <strong>{result.chunks_with_matches} / {result.chunks_analyzed}</strong> sections analysées contiennent des similitudes.
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>

            {/* 4. Sources List */}
            <Grid xs={12}>
                <Card>
                    <CardHeader
                        title="Sources Détectées"
                        avatar={<YoutubeSearchedForIcon />}
                    />
                    <Divider />
                    <CardContent>
                        {result.sources.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 3 }}>
                                <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
                                <Typography>Aucune source externe détectée.</Typography>
                            </Box>
                        ) : (
                            <List>
                                {result.sources.map((source: PlagiatSource, index: number) => (
                                    <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="subtitle2" fontWeight="bold">
                                                Source: {source.source}
                                            </Typography>
                                            <Chip label={`${source.similarity}%`} size="small" color="error" variant="outlined" />
                                        </Box>

                                        {source.source_url && (
                                            <Link href={source.source_url} target="_blank" rel="noopener noreferrer" sx={{ fontSize: '0.875rem' }}>
                                                {source.source_url}
                                            </Link>
                                        )}

                                        <Box sx={{ mt: 1, display: 'flex', gap: 2 }}>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="caption" color="text.secondary">Texte Étudiant (Page {source.page}):</Typography>
                                                <Typography variant="body2" sx={{ fontStyle: 'italic', bgcolor: '#fff', p: 1, border: '1px dashed #ccc' }}>
                                                    "...{source.text}..."
                                                </Typography>
                                            </Box>
                                            {source.matched_text && (
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="caption" color="text.secondary">Texte Source:</Typography>
                                                    <Typography variant="body2" sx={{ bgcolor: '#fff', p: 1, border: '1px dashed #ccc' }}>
                                                        "...{source.matched_text}..."
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>
                                ))}
                            </List>
                        )}
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
}
