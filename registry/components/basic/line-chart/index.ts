
import React from 'react';
import './line-chart.css';

// 舊版本 (向下兼容)
export { LineChart } from './line-chart';
export type { LineChartProps } from './types';
export { D3LineChart } from './core';
export type { LineChartConfig as D3LineChartConfig } from './core';

// 新版本 (推薦使用)
export { 
  LineChartV2, 
  LineChartWithLegacySupport,
  SmoothLineChartV2,
  SteppedLineChartV2,
  DottedLineChartV2,
  LineChartWithPointsV2,
  GradientLineChartV2,
  defaultLineChartProps 
} from './line-chart-v2';
export type { LineChartV2Props } from './line-chart-v2';
export { LineChartCore } from './core/line-chart-core';
export type { 
  LineChartCoreConfig, 
  LineChartData, 
  ProcessedLineDataPoint,
  LineSeriesData,
  PointMarkerConfig
} from './core/line-chart-core';

// 專用變體組件 (使用新架構)
export const SmoothLineChart = (props: any) => {
  return React.createElement(LineChart, { ...props, curve: 'monotone' });
};

export const SteppedLineChart = (props: any) => {
  return React.createElement(LineChart, { ...props, curve: 'step' });
};
