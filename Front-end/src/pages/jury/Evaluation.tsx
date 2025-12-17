import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import Slider from '@mui/material/Slider';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import Alert from '@mui/material/Alert';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

import PdfViewer from 'src/components/PdfViewer';
import { AuditResult } from 'src/sections/audit/audit-result';
import { AnalysisResult } from 'src/api/audit-service';

import { PlagiatResult } from 'src/sections/audit/plagiat-result';
import { plagiatService, PlagiatAnalysisResult } from 'src/api/plagiat-service';

export default function EvaluationPage() {
    const { rapportId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Audit State
    const [auditOpen, setAuditOpen] = useState(false);
    const [auditLoading, setAuditLoading] = useState(false);
    const [auditResult, setAuditResult] = useState<AnalysisResult | null>(null);

    // Plagiat State
    const [plagiatOpen, setPlagiatOpen] = useState(false);
    const [plagiatLoading, setPlagiatLoading] = useState(false);
    const [plagiatResult, setPlagiatResult] = useState<PlagiatAnalysisResult | null>(null);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:5000/api/jury/evaluation/${rapportId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setData(response.data);
            } catch (err) {
                console.error("Error loading evaluation:", err);
                setError("Impossible de charger l'évaluation.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [rapportId]);

    const handleGradeChange = (criterionId: number, value: number) => {
        if (!data) return;
        const newCriteria = data.criteria.map((c: any) => {
            if (c.id === criterionId) return { ...c, score: value };
            return c;
        });
        setData({ ...data, criteria: newCriteria });
    };

    const handleCommentChange = (criterionId: number, value: string) => {
        if (!data) return;
        const newCriteria = data.criteria.map((c: any) => {
            if (c.id === criterionId) return { ...c, comment: value };
            return c;
        });
        setData({ ...data, criteria: newCriteria });
    };

    const calculateTotal = () => {
        if (!data) return 0;
        return data.criteria.reduce((acc: number, c: any) => acc + (c.score || 0), 0);
    };

    const handleGlobalCommentChange = (value: string) => {
        setData({ ...data, global_comment: value });
    };

    const handleSave = async (submit = false) => {
        setSaving(true);
        setSuccess('');
        setError('');

        try {
            const token = localStorage.getItem('token');
            const payload = {
                evaluation_id: data.id,
                global_comment: data.global_comment,
                grades: data.criteria.map((c: any) => ({
                    criterion_id: c.id,
                    score: c.score,
                    comment: c.comment
                })),
                submit: submit
            };

            await axios.post('http://localhost:5000/api/jury/evaluation', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (submit) {
                setSuccess('Évaluation validée avec succès !');
                setTimeout(() => navigate('/jury/assigned-reports'), 2000);
            } else {
                setSuccess('Sauvegardé (brouillon).');
            }
        } catch (err) {
            console.error("Error saving:", err);
            setError("Erreur lors de la sauvegarde.");
        } finally {
            setSaving(false);
        }
    };

    const handleAudit = async () => {
        if (!data?.soutenance_id) return;
        setAuditOpen(true);
        if (auditResult) return;

        setAuditLoading(true);
        try {
            const token = localStorage.getItem('token');
            // Using soutenance ID for audit, but backend might expect rapportId actually based on previous fix
            // But wait, the previous fix used soutenance_id.
            const response = await axios.get(`http://localhost:5000/api/jury/evaluation/${data.soutenance_id}/audit`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAuditResult(response.data);
        } catch (e) {
            console.error(e);
            alert("Erreur lors de l'audit.");
            setAuditOpen(false);
        } finally {
            setAuditLoading(false);
        }
    };

    const handlePlagiat = async () => {
        if (!data?.rapport_id) return;

        setPlagiatOpen(true);
        if (plagiatResult) return; // Cache result

        setPlagiatLoading(true);
        try {
            const response = await plagiatService.analyzeReport(data.rapport_id);
            if (response && response.analysis) {
                setPlagiatResult(response.analysis);
            }
        } catch (e) {
            console.error(e);
            alert("Erreur lors de l'analyse plagiat.");
            setPlagiatOpen(false);
        } finally {
            setPlagiatLoading(false);
        }
    };


    const handleCloseAudit = () => {
        setAuditOpen(false);
    };

    const handleClosePlagiat = () => {
        setPlagiatOpen(false);
    };

    if (loading) return <LinearProgress />;
    if (!data) return <Container><Alert severity="error">{error}</Alert></Container>;

    const totalScore = calculateTotal();

    return (
        <Grid container sx={{ height: 'calc(100vh - 64px)' }}>
            {/* Left: PDF Viewer */}
            <Grid xs={12} md={6} sx={{ borderRight: '1px solid #ddd', height: '100%' }}>
                <Box sx={{ p: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/jury/assigned-reports')}>
                            Retour
                        </Button>
                        <Box>
                            <Button variant="outlined" color="primary" onClick={handlePlagiat} sx={{ mr: 1 }}>
                                Analyse Plagiat
                            </Button>
                            <Button variant="outlined" color="info" onClick={handleAudit}>
                                Lancer l'Audit IA
                            </Button>
                        </Box>
                    </Box>
                    <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                        <PdfViewer rapportId={rapportId || ''} />
                    </Box>
                </Box>
            </Grid>

            {/* Audit Modal */}
            <Dialog open={auditOpen} onClose={handleCloseAudit} maxWidth="md" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Audit & Analyse IA (Beta)
                    <IconButton onClick={handleCloseAudit}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {auditLoading && <LinearProgress sx={{ mb: 2 }} />}
                    {auditResult && <AuditResult result={auditResult} />}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAudit}>Fermer</Button>
                </DialogActions>
            </Dialog>

            {/* Plagiat Modal */}
            <Dialog open={plagiatOpen} onClose={handleClosePlagiat} maxWidth="md" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Détection de Plagiat
                    <IconButton onClick={handleClosePlagiat}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {plagiatLoading && (
                        <Box sx={{ width: '100%', textAlign: 'center', py: 5 }}>
                            <LinearProgress sx={{ mb: 2 }} />
                            <Typography>Analyse approfondie en cours...</Typography>
                            <Typography variant="caption">Cela peut prendre jusqu'à une minute.</Typography>
                        </Box>
                    )}
                    {plagiatResult && <PlagiatResult result={plagiatResult} />}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClosePlagiat}>Fermer</Button>
                </DialogActions>
            </Dialog>


            {/* Right: Evaluation Form */}
            <Grid xs={12} md={6} sx={{ height: '100%', overflowY: 'auto', p: 3, bgcolor: 'background.paper' }}>
                <Typography variant="h5" gutterBottom>
                    Évaluation
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                <Box sx={{ mb: 4 }}>
                    {data.criteria.map((c: any) => (
                        <Card key={c.id} sx={{ p: 2, mb: 2, border: '1px solid #eee' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="subtitle1" fontWeight="bold">{c.name}</Typography>
                                <Typography variant="subtitle2" color="primary">
                                    {c.score}/{c.max}
                                </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary" paragraph>
                                {c.description}
                            </Typography>

                            <Slider
                                value={c.score}
                                min={0}
                                max={c.max}
                                step={0.5}
                                valueLabelDisplay="auto"
                                onChange={(_, val) => handleGradeChange(c.id, val as number)}
                                disabled={data.statut === 'completed'}
                            />

                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Commentaire pour ce critère..."
                                value={c.comment || ''}
                                onChange={(e) => handleCommentChange(c.id, e.target.value)}
                                disabled={data.statut === 'completed'}
                                sx={{ mt: 1 }}
                            />
                        </Card>
                    ))}
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>Commentaire Global</Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="Appréciation générale..."
                        value={data.global_comment || ''}
                        onChange={(e) => handleGlobalCommentChange(e.target.value)}
                        disabled={data.statut === 'completed'}
                    />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                    <Typography variant="h4">
                        Note Totale: {totalScore}/20
                    </Typography>

                    <Box>
                        {data.statut !== 'completed' && (
                            <>
                                <Button
                                    variant="outlined"
                                    startIcon={<SaveIcon />}
                                    onClick={() => handleSave(false)}
                                    disabled={saving}
                                    sx={{ mr: 2 }}
                                >
                                    Sauvegarder
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<CheckCircleIcon />}
                                    onClick={() => handleSave(true)}
                                    disabled={saving}
                                >
                                    Valider
                                </Button>
                            </>
                        )}
                        {data.statut === 'completed' && (
                            <Chip label="Évaluation Validée" color="success" />
                        )}
                    </Box>
                </Box>
            </Grid>
        </Grid>
    );
}
