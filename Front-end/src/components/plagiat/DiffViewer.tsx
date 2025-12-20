import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { diffWords } from 'diff';

interface DiffViewerProps {
  original: string;
  modified: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ original, modified }) => {
  const differences = diffWords(original, modified);

  return (
    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
      <Typography variant="subtitle2" gutterBottom>
        Comparaison côte à côte:
      </Typography>

      <Box sx={{ display: 'flex', gap: 2 }}>
        {/* Texte original */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            Texte source:
          </Typography>
          <Box sx={{ p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
            {differences.map((part: any, index: number) => (
              <Typography
                key={index}
                component="span"
                sx={{
                  backgroundColor: part.added ? 'transparent' : part.removed ? 'error.light' : 'transparent',
                  textDecoration: part.removed ? 'line-through' : 'none',
                  color: part.removed ? 'error.main' : 'text.primary',
                }}
              >
                {part.value}
              </Typography>
            ))}
          </Box>
        </Box>

        {/* Texte modifié */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            Votre texte:
          </Typography>
          <Box sx={{ p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
            {differences.map((part: any, index: number) => (
              <Typography
                key={index}
                component="span"
                sx={{
                  backgroundColor: part.removed ? 'transparent' : part.added ? 'success.light' : 'transparent',
                  color: part.added ? 'success.dark' : 'text.primary',
                }}
              >
                {part.value}
              </Typography>
            ))}
          </Box>
        </Box>
      </Box>

      <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 16, height: 16, bgcolor: 'error.light', borderRadius: 1 }} />
          <Typography variant="caption">Texte supprimé/modifié</Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 16, height: 16, bgcolor: 'success.light', borderRadius: 1 }} />
          <Typography variant="caption">Texte ajouté/similaire</Typography>
        </Box>
      </Box>
    </Paper>
  );
};