import React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { Chart } from 'src/components/chart';

interface AnalyticsSoutenancesTimelineProps {
  title: string;
  subheader?: string;
  chart: {
    categories: string[];
    series: {
      name: string;
      data: number[];
    }[];
  };
}

export function AnalyticsSoutenancesTimeline({
  title,
  subheader,
  chart
}: AnalyticsSoutenancesTimelineProps): React.JSX.Element {
  const theme = useTheme();

  const chartOptions = {
    chart: {
      background: 'transparent',
      stacked: false,
      toolbar: { show: false }
    },
    colors: [
      theme.palette.primary.main,
      theme.palette.success.main,
      theme.palette.error.main
    ],
    dataLabels: {
      enabled: false
    },
    fill: {
      opacity: 1,
      type: 'solid'
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 2
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right'
    },
    markers: {
      size: 5,
      strokeColors: 'transparent'
    },
    stroke: {
      curve: 'smooth',
      width: 3
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
          colors: theme.palette.text.secondary
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: theme.palette.text.secondary
        }
      }
    },
    tooltip: {
      y: {
        formatter: (value: number): string => `${value} soutenances`
      }
    }
  };

  return (
    <Card>
      <CardHeader title={title} subheader={subheader} />
      <CardContent>
        <Box sx={{ height: 360 }}>
          <Chart
            options={chartOptions}
            series={chart.series}
            type="area"
            height={360}
          />
        </Box>
      </CardContent>
    </Card>
  );
}