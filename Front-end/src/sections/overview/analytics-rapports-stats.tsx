// src/sections/analytics/analytics-rapports-stats.tsx
import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import DescriptionIcon from '@mui/icons-material/Description';

interface RapportsStatsProps {
  title: string;
  stats: {
    total: number;
  };
}

export function AnalyticsRapportsStats({ title, stats }: RapportsStatsProps): React.JSX.Element {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: '50%',
            bgcolor: 'info.main', // Bleu pour les rapports
            color: 'white'
          }}>
            <DescriptionIcon />
          </Box>
          <Typography variant="h6">
            {title}
          </Typography>
        </Box>
        <Stack spacing={2}>

          <Box sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary">
              Total: {stats.total} rapports
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}