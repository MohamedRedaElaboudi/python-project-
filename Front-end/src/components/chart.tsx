import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { useTheme } from '@mui/material/styles';

interface ChartProps {
  options: any;
  series: any[];
  type: 'line' | 'area' | 'bar' | 'pie' | 'donut' | 'radialBar' | 'scatter' | 'bubble' | 'heatmap' | 'candlestick' | 'boxPlot' | 'radar' | 'polarArea' | 'rangeBar' | 'rangeArea' | 'treemap';
  height: number;
}

export function Chart({ options, series, type, height }: ChartProps): React.JSX.Element {
  const theme = useTheme();

  const mergedOptions = {
    ...options,
    theme: {
      ...options.theme,
      mode: theme.palette.mode
    }
  };

  return (
    <ReactApexChart
      options={mergedOptions}
      series={series}
      type={type}
      height={height}
    />
  );
}