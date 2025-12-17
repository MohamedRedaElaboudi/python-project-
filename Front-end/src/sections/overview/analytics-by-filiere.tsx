import React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { Chart } from 'src/components/chart';
import Typography from '@mui/material/Typography';

interface AnalyticsByFiliereProps {
  title: string;
  chart: {
    categories: string[];
    series: {
      name: string;
      data: number[];
    }[];
  };
}

export function AnalyticsByFiliere({
  title,
  chart
}: AnalyticsByFiliereProps): React.JSX.Element {
  const theme = useTheme();

  const chartOptions = {
    chart: {
      background: 'transparent',
      stacked: false,
      toolbar: { show: false }
    },
    colors: [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.info.main
    ],
    dataLabels: {
      enabled: false
    },
    fill: {
      opacity: 1,
      type: 'solid'
    },
    grid: {
      borderColor: theme.palette.divider
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '50%',
        distributed: true
      }
    },
    theme: {
      mode: theme.palette.mode
    },
    xaxis: {
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      },
      categories: chart.categories,
      labels: {
        style: {
          colors: theme.palette.text.secondary,
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      title: {
        text: 'Nombre d\'étudiants',
        style: {
          color: theme.palette.text.secondary
        }
      },
      labels: {
        style: {
          colors: theme.palette.text.secondary
        }
      }
    },
    tooltip: {
      y: {
        formatter: (value: number): string => `${value} étudiants`
      }
    }
  };

  return (
    <Card>
      <CardHeader title={title} />
      <CardContent>
        <Box sx={{ height: 300 }}>
          <Chart
            options={chartOptions}
            series={chart.series}
            type="bar"
            height={300}
          />
        </Box>
      </CardContent>
    </Card>
  );
}