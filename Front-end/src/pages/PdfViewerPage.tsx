import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import PdfViewer from 'src/components/PdfViewer';

const PdfViewerPage: React.FC = () => {
  const { rapportId } = useParams<{ rapportId: string }>();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <Button
          startIcon={<ArrowBack />}
          variant="outlined"
          onClick={() => navigate(-1)}
        >
          Retour
        </Button>
        <Typography variant="h6">Visualisation du Rapport</Typography>
      </Box>

      {/* PDF FULL HEIGHT */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {rapportId ? (
          <PdfViewer rapportId={rapportId} />
        ) : (
          <Typography sx={{ p: 3 }}>ID du rapport manquant.</Typography>
        )}
      </Box>
    </Box>
  );
};

export default PdfViewerPage;
