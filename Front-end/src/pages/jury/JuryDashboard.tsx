import { useEffect, useState } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';

import LinearProgress from '@mui/material/LinearProgress';
import { useTheme } from '@mui/material/styles';
import { PlagiarismTable } from '../../components/plagiat/PlagiarismTable';

// KPI Card Component
function KpiCard({ title, value, color = 'primary' }: { title: string, value: string | number, color?: string }) {
    return (
        <Card sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <Typography variant="h3" sx={{ color: `${color}.main`, mb: 1 }}>
                {value}
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
                {title}
            </Typography>
        </Card>
    );
}

// Upcoming Soutenance Card
function SoutenanceCard({ s }: { s: any }) {
    return (
        <Card sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
                <Typography variant="subtitle1">{s.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                    Étudiant: {s.student} ({s.filiere})
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Salle: {s.salle}
                </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h6" color="primary.main">
                    {new Date(s.date).toLocaleDateString()}
                </Typography>
                <Typography variant="body2">
                    {s.time}
                </Typography>
            </Box>
        </Card>
    );
}

export default function JuryDashboard() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/jury/dashboard', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setData(response.data);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <LinearProgress />;

    if (!data) return <Typography>Erreur de chargement des données.</Typography>;

    const { kpis, upcoming_soutenances } = data;

    return (
        <Container maxWidth="xl">
            <Typography variant="h4" sx={{ mb: 5 }}>
                Tableau de Bord Jury
            </Typography>

            <Grid container spacing={3}>
                {/* Global KPIs */}
                <Grid item xs={12} sm={6} md={3}>
                    <KpiCard title="Rapports Assignés" value={kpis.total_assigned} color="info" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KpiCard title="En Attente" value={kpis.pending} color="warning" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KpiCard title="Évalués" value={kpis.evaluated} color="success" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KpiCard title="Moyenne Notes" value={kpis.avg_grade} color="secondary" />
                </Grid>

                {/* Upcoming Soutenances */}
                <Grid item xs={12} md={8}>
                    <Card sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>
                            Prochaines Soutenances
                        </Typography>
                        {upcoming_soutenances.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                Aucune soutenance planifiée prochainement.
                            </Typography>
                        ) : (
                            upcoming_soutenances.map((s: any) => (
                                <SoutenanceCard key={s.id} s={s} />
                            ))
                        )}
                    </Card>
                </Grid>

                {/* Info / Quick Actions */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>
                            Information
                        </Typography>
                        <Typography variant="body2" paragraph>
                            Bienvenue dans votre espace Jury. Ici vous pouvez consulter les rapports qui vous sont assignés et procéder à leur évaluation.
                        </Typography>
                        <Typography variant="body2">
                            Assurez-vous de valider vos évaluations avant la date limite.
                        </Typography>
                    </Card>
                </Grid>

                {/* Plagiarism Table (All Students) */}
                <Grid xs={12}>
                    <PlagiarismTable />
                </Grid>
            </Grid>
        </Container >
    );
}
