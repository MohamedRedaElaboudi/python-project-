import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Alert,
    CircularProgress,
    Divider,
    Button,
    Stack,
    Grid,
} from '@mui/material';
import {
    Assignment,
    Schedule,
    CheckCircle,
    TrendingUp,
    CalendarMonth,
    ArrowForward,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { StatCard, SoutenanceCard } from '../../components/jury';

interface DashboardStats {
    total_reports: number;
    pending_evaluations: number;
    completed_evaluations: number;
    average_grade: number | null;
}

interface Soutenance {
    id: number;
    date: string;
    time: string;
    student_name: string;
    rapport_title: string;
    salle: string;
    role: string;
}

interface DashboardData {
    kpis: DashboardStats;
    upcoming_soutenances: Soutenance[];
}

const JuryDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get<DashboardData>(
                'http://localhost:5000/api/jury/dashboard',
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setDashboardData(response.data);
            setError('');
        } catch (err: any) {
            console.error('Error fetching dashboard data:', err);
            setError(err.response?.data?.error || 'Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress size={60} />
            </Container>
        );
    }

    if (error || !dashboardData) {
        return (
            <Container sx={{ py: 4 }}>
                <Alert severity="error">{error || 'Erreur de chargement'}</Alert>
            </Container>
        );
    }

    const { kpis: stats, upcoming_soutenances } = dashboardData;

    // Safety check for stats
    if (!stats) {
        return (
            <Container sx={{ py: 4 }}>
                <Alert severity="warning">Aucune donnée disponible pour le moment.</Alert>
            </Container>
        );
    }

    // Calculate completion percentage
    const totalEvaluations = (stats.pending_evaluations || 0) + (stats.completed_evaluations || 0);
    const completionPercentage = totalEvaluations > 0
        ? Math.round(((stats.completed_evaluations || 0) / totalEvaluations) * 100)
        : 0;

    // Data for pie chart
    const pieData = [
        { name: 'Complétées', value: stats.completed_evaluations || 0, color: '#4caf50' },
        { name: 'En attente', value: stats.pending_evaluations || 0, color: '#ff9800' },
    ];

    // Data for bar chart (mock data - you can replace with real data)
    const gradeDistribution = [
        { range: '0-5', count: 0 },
        { range: '6-10', count: 1 },
        { range: '11-15', count: 2 },
        { range: '16-20', count: (stats.completed_evaluations || 0) > 0 ? (stats.completed_evaluations || 0) - 3 : 0 },
    ];

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="700" gutterBottom>
                    Tableau de Bord Jury
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Bienvenue dans votre espace jury. Gérez vos évaluations et consultez vos statistiques.
                </Typography>
            </Box>

            {/* KPI Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Rapports Assignés"
                        value={stats.total_reports}
                        icon={<Assignment />}
                        color="primary"
                        subtitle={`${totalEvaluations} évaluations au total`}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="En Attente"
                        value={stats.pending_evaluations}
                        icon={<Schedule />}
                        color="warning"
                        subtitle="À évaluer"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Évalués"
                        value={`${stats.completed_evaluations} (${completionPercentage}%)`}
                        icon={<CheckCircle />}
                        color="success"
                        subtitle={`${completionPercentage}% complétés`}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Moyenne Notes"
                        value={stats.average_grade !== null && stats.average_grade !== undefined ? stats.average_grade.toFixed(1) : 'N/A'}
                        icon={<TrendingUp />}
                        color="info"
                        subtitle="Sur 20"
                    />
                </Grid>
            </Grid>

            {/* Charts Row */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Pie Chart - Evaluation Status */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 2, height: '100%' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight="600" gutterBottom>
                                Répartition des Évaluations
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            {totalEvaluations > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                                    <Typography color="text.secondary">Aucune évaluation disponible</Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Bar Chart - Grade Distribution */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 2, height: '100%' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight="600" gutterBottom>
                                Distribution des Notes
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            {stats.completed_evaluations > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={gradeDistribution}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="range" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#1976d2" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                                    <Typography color="text.secondary">Aucune note disponible</Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Upcoming Soutenances */}
            <Card sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarMonth color="primary" />
                            <Typography variant="h6" fontWeight="600">
                                Prochaines Soutenances
                            </Typography>
                        </Box>
                        <Button
                            endIcon={<ArrowForward />}
                            onClick={() => navigate('/jury/assigned-reports')}
                            sx={{ textTransform: 'none' }}
                        >
                            Voir tous les rapports
                        </Button>
                    </Box>
                    <Divider sx={{ mb: 3 }} />

                    {upcoming_soutenances.length > 0 ? (
                        <Grid container spacing={2}>
                            {upcoming_soutenances.slice(0, 3).map((soutenance) => (
                                <Grid item xs={12} md={4} key={soutenance.id}>
                                    <SoutenanceCard
                                        {...soutenance}
                                        studentName={soutenance.student_name}
                                        rapportTitle={soutenance.rapport_title}
                                        isUpcoming
                                        onClick={() => navigate('/jury/assigned-reports')}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Alert severity="info" sx={{ borderRadius: 2 }}>
                            Aucune soutenance planifiée prochainement.
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card sx={{ borderRadius: 2, mt: 3 }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="600" gutterBottom>
                        Actions Rapides
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <Button
                            variant="contained"
                            startIcon={<Assignment />}
                            onClick={() => navigate('/jury/assigned-reports')}
                            sx={{ flex: 1 }}
                        >
                            Voir mes rapports
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<CalendarMonth />}
                            onClick={() => navigate('/jury/assigned-reports')}
                            sx={{ flex: 1 }}
                        >
                            Calendrier des soutenances
                        </Button>
                    </Stack>
                </CardContent>
            </Card>
        </Container>
    );
};

export default JuryDashboard;
