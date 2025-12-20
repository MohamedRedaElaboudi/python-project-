import { useState, useEffect } from 'react';
import {
    Box,
    Card,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Chip,
    IconButton,
    Button,
    LinearProgress
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface PlagiatDashboardItem {
    id: number;
    studentName: string;
    studentPrenom: string;
    studentMatricule: string;
    specialty: string;
    rapportName: string;
    similarityScore: number;
    originalityScore: number;
    riskLevel: string;
    status: string;
    analyzedAt: string;
}

export function PlagiarismTable() {
    const [data, setData] = useState<PlagiatDashboardItem[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPlagiarismData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/plagiat/dashboard', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setData(response.data);
            } catch (error) {
                console.error("Erreur lors du chargement des données de plagiat", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlagiarismData();
    }, []);

    if (loading) return <LinearProgress />;

    return (
        <Card sx={{ p: 3, mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                    Analyses de Plagiat (Tous les étudiants)
                </Typography>
            </Box>

            <TableContainer component={Paper} elevation={0} variant="outlined">
                <Table sx={{ minWidth: 650 }} aria-label="plagiarism table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Étudiant</TableCell>
                            <TableCell>Matricule</TableCell>
                            <TableCell>Filière</TableCell>
                            <TableCell>Rapport</TableCell>
                            <TableCell align="center">Similarité</TableCell>
                            <TableCell align="center">Originalité</TableCell>
                            <TableCell align="center">Risque</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    Aucune analyse disponible.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell component="th" scope="row">
                                        {row.studentPrenom} {row.studentName}
                                    </TableCell>
                                    <TableCell>{row.studentMatricule}</TableCell>
                                    <TableCell>{row.specialty}</TableCell>
                                    <TableCell>{row.rapportName}</TableCell>
                                    <TableCell align="center">
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <LinearProgress
                                                variant="determinate"
                                                value={row.similarityScore}
                                                sx={{ width: 60, mr: 1, borderRadius: 1 }}
                                                color={row.similarityScore > 50 ? "error" : "primary"}
                                            />
                                            <Typography variant="body2">{row.similarityScore}%</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="center">
                                        {row.originalityScore}%
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={row.riskLevel}
                                            color={row.riskLevel === 'high' ? 'error' : row.riskLevel === 'medium' ? 'warning' : 'success'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton
                                            color="primary"
                                            onClick={() => navigate(`/jury/evaluation/${row.id}`)} // Note: Checks logic for correct route
                                            size="small"
                                        >
                                            <VisibilityIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Card>
    );
}
