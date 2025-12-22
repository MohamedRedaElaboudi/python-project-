import { useState, useEffect } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import DownloadIcon from '@mui/icons-material/Download';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

interface PdfViewerProps {
  url?: string;
  rapportId?: string | number;
}

export default function PdfViewer({ url, rapportId }: PdfViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(url || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rapportName, setRapportName] = useState('Document PDF');

  useEffect(() => {
    if (url) {
      setPdfUrl(url);
    } else if (rapportId) {
      const fetchPdf = async () => {
        setLoading(true);
        setError('');
        try {
          const token = localStorage.getItem('token');

          if (!token) {
            setError("Token d'authentification manquant. Veuillez vous reconnecter.");
            setLoading(false);
            return;
          }

          console.log(`Fetching PDF for rapport ID: ${rapportId}`);

          const response = await axios.get(`http://localhost:5000/api/jury/rapports/${rapportId}/view`, {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob'
          });

          console.log('PDF response received:', response.status, response.headers['content-type']);

          // Check if response is actually a PDF
          const contentType = response.headers['content-type'];
          if (!contentType || !contentType.includes('application/pdf')) {
            console.error('Response is not a PDF:', contentType);
            setError(`Format de fichier incorrect: ${contentType || 'inconnu'}. Un fichier PDF est attendu.`);
            setLoading(false);
            return;
          }

          const blob = new Blob([response.data], { type: 'application/pdf' });
          const objectUrl = URL.createObjectURL(blob);
          setPdfUrl(objectUrl);

          // Try to get filename from headers
          const contentDisposition = response.headers['content-disposition'];
          if (contentDisposition) {
            const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
            if (matches && matches[1]) {
              setRapportName(matches[1].replace(/['"]/g, ''));
            }
          }

          console.log('PDF loaded successfully');
        } catch (err: any) {
          console.error("Error fetching PDF:", err);

          if (err.response) {
            // Server responded with error
            const status = err.response.status;
            const data = err.response.data;

            console.error('Error response:', status, data);

            if (status === 404) {
              setError("Document PDF introuvable. Le rapport n'existe peut-être pas ou a été supprimé.");
            } else if (status === 401 || status === 403) {
              setError("Accès non autorisé. Veuillez vous reconnecter.");
            } else if (status === 500) {
              setError("Erreur serveur lors du chargement du PDF. Veuillez réessayer plus tard.");
            } else {
              // Try to extract message from response
              try {
                const reader = new FileReader();
                reader.onload = () => {
                  try {
                    const errorData = JSON.parse(reader.result as string);
                    setError(errorData.message || "Impossible de charger le document PDF.");
                  } catch {
                    setError("Impossible de charger le document PDF.");
                  }
                };
                reader.readAsText(data);
              } catch {
                setError("Impossible de charger le document PDF.");
              }
            }
          } else if (err.request) {
            // Request made but no response
            console.error('No response received:', err.request);
            setError("Pas de réponse du serveur. Vérifiez que le backend est démarré.");
          } else {
            // Error in request setup
            console.error('Request setup error:', err.message);
            setError(`Erreur de requête: ${err.message}`);
          }
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
  }, [url, rapportId]);

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = rapportName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="body2" color="text.secondary">
          Chargement du document...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          bgcolor: '#fef2f2',
          borderRadius: 2,
        }}
      >
        <PictureAsPdfIcon sx={{ fontSize: 64, color: 'error.main', mb: 2, opacity: 0.5 }} />
        <Alert severity="error" sx={{ maxWidth: 500 }}>
          {error}
        </Alert>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
          Rapport ID: {rapportId}
        </Typography>
      </Box>
    );
  }

  if (!pdfUrl) {
    return (
      <Box
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          bgcolor: '#f5f5f5',
          borderRadius: 2,
        }}
      >
        <PictureAsPdfIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
        <Typography variant="body1" color="text.secondary">
          Aucun document à afficher
        </Typography>
      </Box>
    );
  }

  return (
    <Paper
      elevation={isFullscreen ? 24 : 2}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : 'auto',
        left: isFullscreen ? 0 : 'auto',
        right: isFullscreen ? 0 : 'auto',
        bottom: isFullscreen ? 0 : 'auto',
        zIndex: isFullscreen ? 9999 : 'auto',
        borderRadius: isFullscreen ? 0 : 2,
      }}
    >
      {/* Toolbar */}
      <Toolbar
        variant="dense"
        sx={{
          bgcolor: 'grey.100',
          borderBottom: '1px solid',
          borderColor: 'divider',
          minHeight: 48,
        }}
      >
        <PictureAsPdfIcon sx={{ mr: 1, color: 'error.main' }} />
        <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: 500 }}>
          {rapportName}
        </Typography>

        <Tooltip title="Télécharger">
          <IconButton size="small" onClick={handleDownload} sx={{ mr: 1 }}>
            <DownloadIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}>
          <IconButton size="small" onClick={toggleFullscreen}>
            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
        </Tooltip>
      </Toolbar>

      {/* PDF Iframe */}
      <Box sx={{ flexGrow: 1, position: 'relative', overflow: 'hidden' }}>
        <iframe
          src={pdfUrl}
          width="100%"
          height="100%"
          title="PDF Viewer"
          style={{
            border: "none",
            display: 'block',
          }}
        />
      </Box>
    </Paper>
  );
}
