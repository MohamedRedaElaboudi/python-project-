import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';

interface SallesStatsProps {
  title: string;
  stats: {
    total: number;
    occupied: number;
  };
}

export function AnalyticsSallesStats({ title, stats }: SallesStatsProps): React.JSX.Element {
  const occupationRate = stats.total > 0 ? Math.round((stats.occupied / stats.total) * 100) : 0;

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <MeetingRoomIcon sx={{ mr: 1, fontSize: 40, color: 'secondary.main' }} />
          <Box>
            <Typography variant="h5">{stats.total}</Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
        </Box>

      </CardContent>
    </Card>
  );
}