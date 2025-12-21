import React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import { Chart } from 'src/components/chart';
import { useTheme } from '@mui/material/styles';
import type { UserByRole } from 'src/types/dashboard';

interface AnalyticsUsersByRoleProps {
  title?: string;
  data: UserByRole[];
}

const roleColors = {
  admin: '#FF6B6B',
  teacher: '#4ECDC4',
  student: '#45B7D1',
  jury: '#96CEB4',
  chef: '#FFEAA7'
};

const roleIcons = {
  admin: '👨‍💼',
  teacher: '👨‍🏫',
  student: '🎓',
  jury: '⚖️',
  chef: '👨‍🍳'
};

const roleLabels = {
  admin: 'Administrateurs',
  teacher: 'Enseignants',
  student: 'Étudiants',
  jury: 'Jurys',
  chef: 'Chefs'
};

export function AnalyticsUsersByRole({
  title = 'Répartition par rôle',
  data
}: AnalyticsUsersByRoleProps): React.JSX.Element {
  const theme = useTheme();

  // Préparer les données pour le graphique
  const chartSeries = data.map(item => item.count);
  const chartLabels = data.map(item => roleLabels[item.role] || item.role);

  const chartOptions = {
    chart: {
      background: 'transparent',
      stacked: false,
      toolbar: { show: false }
    },
    colors: [
      theme.palette.error.main,     // admin
      theme.palette.info.main,      // teacher
      theme.palette.primary.main,   // student
      theme.palette.success.main,   // jury
      theme.palette.warning.main    // chef
    ],
    dataLabels: {
      enabled: true,
      formatter: (val: number): string => `${Math.round(val)}%`
    },
    labels: chartLabels,
    legend: {
      show: false
    },
    plotOptions: {
      pie: {
        donut: {
          size: '60%'
        },
        expandOnClick: false
      }
    },
    states: {
      active: {
        filter: { type: 'none' }
      },
      hover: {
        filter: { type: 'none' }
      }
    },
    stroke: {
      width: 0
    },
    theme: {
      mode: theme.palette.mode
    },
    tooltip: {
      fillSeriesColor: false,
      y: {
        formatter: (value: number): string => `${value} utilisateurs`
      }
    }
  };

  const totalUsers = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card>
      <CardHeader title={title} />
      <CardContent>
        <Box sx={{ height: 240, position: 'relative' }}>
          <Chart
            options={chartOptions}
            series={chartSeries}
            type="donut"
            height={240}
          />
        </Box>

        <Stack spacing={2} sx={{ mt: 3 }}>
          {data.map((item) => (
            <Stack
              key={item.role}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={2}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar
                  sx={{
                    bgcolor: roleColors[item.role],
                    width: 32,
                    height: 32
                  }}
                >
                  {roleIcons[item.role]}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2">
                    {roleLabels[item.role] || item.role}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary' }}
                  >
                    {item.count} utilisateurs
                  </Typography>
                </Box>
              </Stack>
              <Typography variant="subtitle2">
                {item.percentage}%
              </Typography>
            </Stack>
          ))}

          <Box sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary">
              Total: {totalUsers} utilisateurs
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}