import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import EditIcon from '@mui/icons-material/Edit';

export default function MyReports() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [reports, setReports] = useState<any[]>([]);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/jury/reports', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setReports(response.data);
            } catch (error) {
                console.error("Error fetching reports:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'success';
            case 'pending': return 'warning';
            default: return 'default';
        }
    };

    if (loading) return <LinearProgress />;

    return (
        <Container maxWidth="xl">
            <Typography variant="h4" sx={{ mb: 5 }}>
                Rapports Assignés
            </Typography>

            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Titre du Rapport</TableCell>
                                <TableCell>Étudiant</TableCell>
                                <TableCell>Filière</TableCell>
                                <TableCell>Date Soutenance</TableCell>
                                <TableCell>Statut Éval.</TableCell>
                                <TableCell>Note</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reports.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        Aucun rapport assigné.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                reports.map((row) => (
                                    <TableRow key={row.id} hover>
                                        <TableCell>{row.title}</TableCell>
                                        <TableCell>{row.student}</TableCell>
                                        <TableCell>{row.filiere} ({row.niveau})</TableCell>
                                        <TableCell>{new Date(row.soutenance_date).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={row.evaluation_status === 'completed' ? 'Évalué' : 'En Attente'}
                                                color={getStatusColor(row.evaluation_status) as any}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {row.note ? <Typography fontWeight="bold">{row.note}/20</Typography> : '-'}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Button
                                                variant="contained"
                                                size="small"
                                                startIcon={<EditIcon />}
                                                onClick={() => navigate(`/jury/evaluation/${row.id}`)}
                                            >
                                                Évaluer
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>
        </Container>
    );
}
