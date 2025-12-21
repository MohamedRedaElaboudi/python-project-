import { useState, useEffect } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

interface PdfViewerProps {
  url?: string;
  rapportId?: string | number;
}

export default function PdfViewer({ url, rapportId }: PdfViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(url || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (url) {
      setPdfUrl(url);
    } else if (rapportId) {
      const fetchPdf = async () => {
        setLoading(true);
        setError('');
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`http://localhost:5000/api/jury/rapports/${rapportId}/view`, {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob'
          });

          const blob = new Blob([response.data], { type: 'application/pdf' });
          const objectUrl = URL.createObjectURL(blob);
          setPdfUrl(objectUrl);
        } catch (err) {
          console.error("Error fetching PDF:", err);
          setError("Impossible de charger le document PDF.");
        } finally {
          setLoading(false);
        }
      };

      fetchPdf();
    }

    // Cleanup
    return () => {
      if (pdfUrl && !url) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [url, rapportId, pdfUrl]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!pdfUrl) {
    return (
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', bgcolor: '#f5f5f5' }}>
        <p>Aucun document à afficher.</p>
      </Box>
    );
  }

  return (
    <iframe
      src={pdfUrl}
      width="100%"
      height="100%"
      title="PDF Viewer"
      style={{ border: "none", minHeight: '600px' }}
    />
  );
}
