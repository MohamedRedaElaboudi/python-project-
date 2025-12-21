import React, { useRef, useState } from 'react';
import { Page, pdfjs, Document } from 'react-pdf';
import { Box, Paper, Button, Tooltip, Typography, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface MatchArea {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  similarity: number;
  text: string;
}

interface PdfHighlighterProps {
  pdfUrl: string;
  matches: MatchArea[];
  selectedMatch?: MatchArea | null;
  onMatchSelect?: (match: MatchArea) => void;
}

const HighlightOverlay = styled('div')<{ similarity: number }>(({ similarity, theme }) => {
  let color = 'rgba(76, 175, 80, 0.3)'; // Vert
  let borderColor = 'rgba(76, 175, 80, 0.6)';

  if (similarity > 30 && similarity <= 60) {
    color = 'rgba(255, 152, 0, 0.3)'; // Orange
    borderColor = 'rgba(255, 152, 0, 0.6)';
  } else if (similarity > 60) {
    color = 'rgba(244, 67, 54, 0.3)'; // Rouge
    borderColor = 'rgba(244, 67, 54, 0.6)';
  }

  return {
    position: 'absolute',
    backgroundColor: color,
    border: `2px solid ${borderColor}`,
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: color.replace('0.3', '0.5'),
      border: `2px solid ${borderColor.replace('0.6', '0.9')}`,
      transform: 'scale(1.02)',
    },
  };
});

export const PdfHighlighter: React.FC<PdfHighlighterProps> = ({
  pdfUrl,
  matches,
  selectedMatch,
  onMatchSelect,
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.5);
  const [pageDimensions, setPageDimensions] = useState<Map<number, { width: number; height: number }>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  const onDocumentLoadSuccess = ({ numPages: nextNumPages }: { numPages: number }) => {
    setNumPages(nextNumPages);
  };

  const onPageLoadSuccess = (page: any, pageNum: number) => {
    const viewport = page.getViewport({ scale: 1 });
    setPageDimensions(prev => new Map(prev).set(pageNum, {
      width: viewport.width,
      height: viewport.height,
    }));
  };

  const getMatchStyle = (match: MatchArea) => {
    const pageDim = pageDimensions.get(match.page);
    if (!pageDim) return {};

    return {
      left: `${(match.x) * pageDim.width}px`,
      top: `${(match.y * pageDim.height)}px`,
      width: `${(match.width * pageDim.width)}px`,
      height: `${(match.height * pageDim.height)}px`,
    };
  };

  const filteredMatches = matches.filter(match => match.page === pageNumber);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));

  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Visualisation du document
          {numPages > 0 && ` (Page ${pageNumber} / ${numPages})`}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Zoom avant">
            <IconButton onClick={handleZoomOut} size="small">
              <ZoomOutIcon />
            </IconButton>
          </Tooltip>

          <Typography variant="body2" sx={{ alignSelf: 'center' }}>
            {Math.round(scale * 100)}%
          </Typography>

          <Tooltip title="Zoom arrière">
            <IconButton onClick={handleZoomIn} size="small">
              <ZoomInIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2,
        mb: 2
      }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<NavigateBeforeIcon />}
          onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
          disabled={pageNumber <= 1}
        >
          Précédent
        </Button>

        <Typography variant="body2">
          Page {pageNumber} sur {numPages}
        </Typography>

        <Button
          variant="outlined"
          size="small"
          endIcon={<NavigateNextIcon />}
          onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages))}
          disabled={pageNumber >= numPages}
        >
          Suivant
        </Button>
      </Box>

      <Box
        ref={containerRef}
        sx={{
          flex: 1,
          overflow: 'auto',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          position: 'relative',
          backgroundColor: 'grey.100',
          display: 'flex',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<Typography>Chargement du document...</Typography>}
          error={<Typography color="error">Erreur de chargement du PDF</Typography>}
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            onLoadSuccess={(page) => onPageLoadSuccess(page, pageNumber)}
            loading={<Typography>Chargement de la page...</Typography>}
            renderAnnotationLayer={false}
            renderTextLayer={false}
          >
            {/* Surcharges pour les correspondances */}
            {filteredMatches.map((match, index) => (
              <Tooltip
                key={index}
                title={
                  <Box>
                    <Typography variant="caption" display="block">
                      Similarité: <strong>{match.similarity}%</strong>
                    </Typography>
                    <Typography variant="caption" display="block">
                      {match.text.length > 100 ? `${match.text.substring(0, 100)}...` : match.text}
                    </Typography>
                  </Box>
                }
                arrow
              >
                <HighlightOverlay
                  similarity={match.similarity}
                  style={getMatchStyle(match)}
                  onClick={() => onMatchSelect?.(match)}
                  sx={{
                    outline: selectedMatch === match ? '3px solid #2196F3' : 'none',
                    outlineOffset: '2px',
                  }}
                />
              </Tooltip>
            ))}
          </Page>
        </Document>
      </Box>

      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 20, height: 20, bgcolor: 'rgba(76, 175, 80, 0.3)', border: '1px solid rgba(76, 175, 80, 0.6)' }} />
          <Typography variant="caption">Faible similarité (&lt;30%)</Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 20, height: 20, bgcolor: 'rgba(255, 152, 0, 0.3)', border: '1px solid rgba(255, 152, 0, 0.6)' }} />
          <Typography variant="caption">Similarité moyenne (30-60%)</Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 20, height: 20, bgcolor: 'rgba(244, 67, 54, 0.3)', border: '1px solid rgba(244, 67, 54, 0.6)' }} />
          <Typography variant="caption">Forte similarité (&gt;60%)</Typography>
        </Box>
      </Box>
    </Paper>
  );
};