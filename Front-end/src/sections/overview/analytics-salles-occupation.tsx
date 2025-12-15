import React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { Chart } from 'src/components/chart';
import Typography from '@mui/material/Typography';

interface AnalyticsSallesOccupationProps {
  title: string;
  chart: {
    series: {
      label: string;
      value: number;
    }[];
  };
}

export function AnalyticsSallesOccupation({
  title,
  chart
}: AnalyticsSallesOccupationProps): React.JSX.Element {
  const theme = useTheme();

  const chartSeries = chart.series.map(item => item.value);
  const chartLabels = chart.series.map(item => item.label);

  const chartOptions = {
    chart: {
      background: 'transparent',
      stacked: false,
      toolbar: { show: false }
    },
    colors: [
      theme.palette.warning.main,
      theme.palette.success.main
    ],
    dataLabels: {
      enabled: true,
      formatter: (val: number): string => `${Math.round(val)}%`
    },
    labels: chartLabels,
    legend: {
      show: true,
      position: 'bottom'
    },
    plotOptions: {
      pie: {
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
        formatter: (value: number): string => `${value} salles`
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
            series={chartSeries}
            type="pie"
            height={300}
          />
        </Box>
      </CardContent>
    </Card>
  );
}