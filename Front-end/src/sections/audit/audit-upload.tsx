// src/sections/audit/audit-upload.tsx

import React from 'react';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

interface AuditUploadProps {
  file: File | null;
  loading: boolean;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAnalyze: () => void;
}

export function AuditUpload({ file, loading, onFileChange, onAnalyze }: AuditUploadProps) {
  return (
    <Paper elevation={2} sx={{ p: 4, mb: 5, textAlign: 'center' }}>
      
      <Typography variant="h6" gutterBottom>
        Étape 1 : Choisissez votre rapport à analyser
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Formats supportés : PDF, DOCX. Taille maximale : 10 Mo.
      </Typography>

      <Button
        variant="outlined"
        component="label"
        startIcon={<CloudUploadIcon />}
        sx={{ mr: 2 }}
      >
        Sélectionner un fichier
        <input type="file" hidden onChange={onFileChange} accept=".pdf,.docx" />
      </Button>

      {file && (
        <Box component="span" sx={{ fontStyle: 'italic', color: 'text.primary' }}>
          {file.name}
        </Box>
      )}

      <Box sx={{ mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={onAnalyze}
          disabled={!file || loading}
          size="large"
        >
          {loading ? 'Analyse en cours...' : 'Lancer l’Audit'}
        </Button>
      </Box>

    </Paper>
  );
}
