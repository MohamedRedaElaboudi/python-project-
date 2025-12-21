import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import SchoolIcon from '@mui/icons-material/School';

interface SoutenancesStatsProps {
  title: string;
  stats: {
    total: number;
  };
}

export function AnalyticsSoutenancesStats({ title, stats }: SoutenancesStatsProps): React.JSX.Element {
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
            bgcolor: 'primary.main',
            color: 'white'
          }}>
            <SchoolIcon /> {/* Plus besoin du commentaire eslint */}
          </Box>
          <Typography variant="h6">
            {title}
          </Typography>
        </Box>
        <Stack spacing={2}>

          <Box sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary">
              Total: {stats.total} soutenances
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}