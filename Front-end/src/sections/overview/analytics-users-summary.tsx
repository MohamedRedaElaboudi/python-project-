import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import PeopleIcon from '@mui/icons-material/People';

interface UsersSummaryProps {
  title: string;
  stats: {
    total: number;
    admin: number;
    teacher: number;
    student: number;
    jury: number;
  };
}

export function AnalyticsUsersSummary({ title, stats }: UsersSummaryProps): React.JSX.Element {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PeopleIcon sx={{ mr: 1, fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h5">{stats.total}</Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">• Admins: {stats.admin}</Typography>
          <Typography variant="body2">• Enseignants: {stats.teacher}</Typography>
          <Typography variant="body2">• Étudiants: {stats.student}</Typography>
          <Typography variant="body2">• Jurys: {stats.jury}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}