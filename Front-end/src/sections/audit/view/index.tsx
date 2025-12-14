import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { DashboardContent } from 'src/layouts/dashboard';

// Import des modules
import { AuditUpload } from '../audit-upload';
import { AuditResult } from '../audit-result';
import { auditService, AnalysisResult } from '../../../services/audit-service';

export function AuditView() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // Gestion du changement de fichier
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setResult(null); // Reset results
    }
  }, []);

  // Gestion de l'appel Axios
  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const data = await auditService.analyzeReport(file);
      setResult(data);
    } catch (error) {
      alert("Erreur lors de l'analyse. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardContent>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 5 }}>
        <Typography variant="h4">
          Audit & Correction ENSIASD
        </Typography>
      </Stack>

      {/* Module 1 : Upload */}
      <AuditUpload 
        file={file} 
        loading={loading} 
        onFileChange={handleFileChange} 
        onAnalyze={handleAnalyze} 
      />

      {/* Indicateur de chargement global */}
      {loading && (
        <Box sx={{ width: '100%', textAlign: 'center', mt: 5 }}>
           <CircularProgress />
           <Typography variant="subtitle1" sx={{ mt: 2, color: 'text.secondary' }}>
             Lecture et analyse critique en cours...
           </Typography>
        </Box>
      )}

      {/* Module 2 : Résultats */}
      {result && !loading && (
        <AuditResult result={result} />
      )}

    </DashboardContent>
  );
}